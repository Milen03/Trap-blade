// Проверка на токените, които клиентът получава от Google и Apple.
//
// Как работи входът с Google/Apple:
//   1. Клиентът (React) отваря прозореца на Google/Apple и потребителят се логва там.
//   2. Google/Apple връщат на клиента "ID token" — JWT, подписан с техен частен ключ.
//   3. Клиентът праща този токен към нашия сървър (POST /api/login/google или /api/login/apple).
//   4. Тук проверяваме подписа с ПУБЛИЧНИТЕ ключове на Google/Apple (JWKS) и че токенът е
//      издаден точно за нашето приложение (audience = нашия Client ID) и не е изтекъл.
//   5. Ако е валиден, вярваме на данните в него (sub, email, име) и логваме потребителя.
//
// Никога не вярвай на имейл/ID, пратени "на ръка" от клиента — само на проверения токен.

const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
const { httpError } = require('./errHandler');

const PROVIDERS = {
    google: {
        name: 'Google',
        // Тук Google публикува публичните си ключове.
        jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
        issuer: ['accounts.google.com', 'https://accounts.google.com'],
        // Client ID от Google Cloud Console (същият като VITE_GOOGLE_CLIENT_ID в клиента).
        clientIdEnv: 'GOOGLE_CLIENT_ID',
        // Ползва се, ако GOOGLE_CLIENT_ID липсва в .env. Client ID-то е публично — няма проблем да е в кода.
        defaultClientId: '323737991336-7o24jdltf0lqgh5pm3q4prs0asmtm5il.apps.googleusercontent.com',
    },
    apple: {
        name: 'Apple',
        jwksUri: 'https://appleid.apple.com/auth/keys',
        issuer: 'https://appleid.apple.com',
        // Services ID от Apple Developer (същият като VITE_APPLE_CLIENT_ID в клиента).
        clientIdEnv: 'APPLE_CLIENT_ID',
    },
};

// Клиентите за ключовете се създават веднъж и кешират ключовете,
// за да не ги тегля от Google/Apple при всеки вход.
const keyClients = {};

function getKeyClient(providerName) {
    if (!keyClients[providerName]) {
        keyClients[providerName] = jwksRsa({
            jwksUri: PROVIDERS[providerName].jwksUri,
            cache: true,
            rateLimit: true,
        });
    }
    return keyClients[providerName];
}

// Проверява ID token и връща съдържанието му (payload), например:
// { sub: '1234567890', email: 'ivan@gmail.com', email_verified: true, given_name: 'Иван', ... }
function verifyIdToken(providerName, idToken) {
    const provider = PROVIDERS[providerName];
    const clientId = process.env[provider.clientIdEnv] || provider.defaultClientId;

    if (!clientId) {
        return Promise.reject(httpError(500, `Входът с ${provider.name} не е настроен на сървъра (липсва ${provider.clientIdEnv}).`));
    }
    if (typeof idToken !== 'string' || !idToken) {
        return Promise.reject(httpError(400, `Липсва токен от ${provider.name}.`));
    }

    // Всеки токен казва в header-а си с кой ключ (kid) е подписан — взимаме точно този ключ.
    const getKey = (header, callback) => {
        getKeyClient(providerName)
            .getSigningKey(header.kid)
            .then((key) => callback(null, key.getPublicKey()))
            .catch(callback);
    };

    const options = {
        algorithms: ['RS256'],
        issuer: provider.issuer,
        // Може да има няколко Client ID-та, разделени със запетая (например уеб + мобилно приложение).
        audience: clientId.split(',').map((id) => id.trim()),
    };

    return new Promise((resolve, reject) => {
        jwt.verify(idToken, getKey, options, (err, payload) => {
            if (err) {
                reject(httpError(401, `Невалиден вход с ${provider.name}. Опитай отново.`));
                return;
            }
            resolve(payload);
        });
    });
}

module.exports = {
    verifyIdToken,
}
