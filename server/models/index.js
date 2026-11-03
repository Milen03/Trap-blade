const userModel = require('./userModel');
const tokenBlacklistModel = require('./tokenBlacklistModel');
const workDayModel = require('./workDayModel');
const appointmentModel = require('./appointmentModel');

// Привежда индексите в базата в синхрон със схемите. Вика се при старта на сървъра и в тестовете.
// - users: syncIndexes маха и стари индекси. Старият модел имаше уникално поле username; ако индексът
//   му остане в базата, всеки нов потребител без username ще дава грешка "вече съществува".
// - останалите: init() създава индексите, ако ги няма (например уникалния срещу двойно записване).
async function initIndexes() {
    await userModel.syncIndexes();
    await Promise.all([
        tokenBlacklistModel.init(),
        workDayModel.init(),
        appointmentModel.init(),
    ]);
}

module.exports = {
    userModel,
    tokenBlacklistModel,
    workDayModel,
    appointmentModel,
    initIndexes,
}
