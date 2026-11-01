const { userModel } = require('../models');
const { httpError, validators } = require('../utils');

const BARBER_ROLES = ['barber', 'owner'];
// Полетата, които са публични — без имейл, телефон и т.н.
const PUBLIC_FIELDS = 'firstName lastName title isLead services';

// Намира бръснар (или собственика) по id. Хвърля 400/404, ако id-то е грешно или няма такъв бръснар.
async function findBarber(barberId) {
    if (!validators.isObjectId(barberId)) {
        throw httpError(400, 'Невалиден barberId');
    }
    const barber = await userModel.findOne({ _id: barberId, role: { $in: BARBER_ROLES } });
    if (!barber) {
        throw httpError(404, 'Няма такъв бръснар');
    }
    return barber;
}

// GET /api/barbers — публичен списък с бръснарите и техните услуги и цени.
// Главният бръснар е пръв.
async function list(req, res, next) {
    try {
        const barbers = await userModel
            .find({ role: { $in: BARBER_ROLES } })
            .select(PUBLIC_FIELDS)
            .sort({ isLead: -1, created_at: 1 });
        res.status(200).json(barbers);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    BARBER_ROLES,
    findBarber,
    list,
};
