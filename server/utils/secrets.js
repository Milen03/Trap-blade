// Тайните за подписване на JWT и бисквитките идват от .env (SECRET, COOKIESECRET).
// В production сървърът отказва да тръгне без тях — иначе всеки, който знае
// стойността по подразбиране, би могъл да си направи валиден токен за вход.
// В development, ако липсват, ползваме временна стойност и пишем предупреждение.
function readSecret(name) {
    const value = process.env[name];
    if (value) {
        return value;
    }
    if (process.env.NODE_ENV === 'production') {
        throw new Error(`Липсва ${name} в променливите на средата. Сложи дълъг случаен низ.`);
    }
    console.warn(`⚠ Липсва ${name} в server/.env — ползвам временна стойност (само за development).`);
    return `dev-only-${name}`;
}

module.exports = {
    readSecret,
};
