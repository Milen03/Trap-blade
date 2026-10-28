const jwt = require('jsonwebtoken');

const DEV_SECRET = 'trapblade-dev-secret-ne-se-polzva-v-production';

// Тайната, с която подписваме токените. Който я знае, може да си направи токен
// за всеки потребител — затова в production тя е задължителна и трябва да е дълга.
// Генерирай я с: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
function getSecret() {
    const secret = process.env.SECRET;

    if (process.env.NODE_ENV === 'production') {
        if (!secret || secret.length < 32) {
            // Спираме сървъра веднага, вместо да тръгне с позната на всички тайна.
            throw new Error('SECRET липсва или е по-къса от 32 символа. Задай я в .env / настройките на хостинга.');
        }
        return secret;
    }

    return secret || DEV_SECRET;
}

const secret = getSecret();

// Токенът за сесията, който пазим в бисквитката.
// expiresIn: колко време е валиден — '1d' (1 ден), '365d' (365 дни) и т.н.
function createToken(data, expiresIn = '1d') {
    return jwt.sign(data, secret, { expiresIn });
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        // algorithms: приемаме само HS256 — алгоритъма, с който сами подписваме.
        jwt.verify(token, secret, { algorithms: ['HS256'] }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

module.exports = {
    createToken,
    verifyToken
}
