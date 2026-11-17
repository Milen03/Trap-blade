// Проверка на токена, който клиентът получава от Google ("Продължи с Google").
//
// Как работи входът с Google:
//   1. Клиентът показва бутона на Google и потребителят се логва там.
//   2. Google връща на клиента "ID token" — JWT, подписан с частния ключ на Google.
//   3. Клиентът праща токена към нас (POST /api/login/google).
//   4. Тук проверяваме подписа с ПУБЛИЧНИТЕ ключове на Google, че е издаден от Google,
//      за НАШЕТО приложение (audience = GOOGLE_CLIENT_ID) и че не е изтекъл.
//   5. Само тогава вярваме на данните в него (sub, email, имена).
//
// Никога не вярвай на имейл/ID, пратени "на ръка" от клиента — само на проверения токен.
const jwt = require('jsonwebtoken');
const { httpError } = require('./errHandler');

const GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

// Ключовете на Google се кешират — не ги теглим при всеки вход.
// jwks-rsa се зарежда чак тук (а не при старта на сървъра): ако с този пакет има проблем,
// пада само входът с Google, а не целият сървър.
// ВАЖНО: jwks-rsa остава на версия 3 — версия 4 зарежда jose@6, който е само ES module,
// и на Node без require(esm) сървърът не тръгва (виж tests/unit/startup.test.js).
let keys = null;
function getKeys() {
    if (!keys) {
        const jwksClient = require('jwks-rsa');
        keys = jwksClient({ jwksUri: GOOGLE_JWKS_URI, cache: true, rateLimit: true });
    }
    return keys;
}

// Входът с Google е включен само ако на сървъра е зададен Client ID-то.
function googleClientId() {
    return (process.env.GOOGLE_CLIENT_ID || '').trim();
}

// Проверява ID token от Google и връща съдържанието му, например:
// { sub: '1234567890', email: 'ivan@gmail.com', email_verified: true, given_name: 'Иван', family_name: 'Петров' }
async function verifyGoogleIdToken(idToken) {
    const clientId = googleClientId();
    if (!clientId) {
        throw httpError(503, 'Входът с Google още не е настроен. Влез с имейл и парола.');
    }
    if (typeof idToken !== 'string' || !idToken) {
        throw httpError(400, 'Липсва отговор от Google. Опитай пак.');
    }

    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
        throw httpError(401, 'Невалиден отговор от Google. Опитай пак.');
    }

    try {
        const signingKey = await getKeys().getSigningKey(decoded.header.kid);
        return jwt.verify(idToken, signingKey.getPublicKey(), {
            algorithms: ['RS256'],
            audience: clientId,
            issuer: GOOGLE_ISSUERS,
            // Малко толеранс, ако часовникът на сървъра леко се разминава с този на Google.
            clockTolerance: 60,
        });
    } catch (err) {
        // В логовете пишем точната причина, на потребителя — общо съобщение.
        console.error('Google токенът е отхвърлен:', err.message);
        throw httpError(401, 'Входът с Google не успя. Опитай пак.');
    }
}

module.exports = {
    googleClientId,
    verifyGoogleIdToken,
};
