const jwt = require('jsonwebtoken');
const secret = process.env.SECRET || 'SoftSecret';

// Токенът за сесията, който пазим в бисквитката.
// expiresIn: колко време е валиден — '1d' (1 ден), '7d' (7 дни) и т.н.
function createToken(data, expiresIn = '1d') {
    return jwt.sign(data, secret, { expiresIn });
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, data) => {
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
