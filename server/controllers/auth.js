const {
    userModel,
    tokenBlacklistModel
} = require('../models');

const utils = require('../utils');
const { authCookieName } = require('../app-config');
const { cleanString, pickProfile, validateProfile } = utils.validators;

// "Запомни ме": колко дни остава логнат потребителят.
const REMEMBER_ME_DAYS = 7;

// Настройки на бисквитката с токена.
// httpOnly: JavaScript в браузъра НЕ може да я прочете -> защита от XSS.
// В production клиентът и сървърът са на различни домейни, затова трябват sameSite: 'none' + secure.
function cookieOptions() {
    if (process.env.NODE_ENV === 'production') {
        return { httpOnly: true, sameSite: 'none', secure: true };
    }
    return { httpOnly: true };
}

// Създава наш JWT за потребителя и го записва в бисквитката.
// remember = false -> бисквитката изчезва при затваряне на браузъра (и токенът важи 1 ден).
// remember = true  -> бисквитката и токенът важат REMEMBER_ME_DAYS дни.
function setAuthCookie(res, user, remember) {
    const token = utils.jwt.createToken({ id: user._id }, remember ? `${REMEMBER_ME_DAYS}d` : '1d');
    const options = cookieOptions();
    if (remember) {
        options.maxAge = REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000;
    }
    res.cookie(authCookieName, token, options);
}

// POST /api/register — регистрация с имейл и парола.
async function register(req, res, next) {
    const profile = pickProfile(req.body);
    const email = cleanString(req.body.email).toLowerCase();
    const { password, rePassword } = req.body;

    const profileError = validateProfile(profile);
    if (profileError) {
        return res.status(400).send({ message: profileError });
    }
    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).send({ message: 'Паролата трябва да е поне 6 символа' });
    }
    if (password !== rePassword) {
        return res.status(400).send({ message: 'Паролите не съвпадат' });
    }

    try {
        // Паролата се хешира автоматично в userModel (pre 'save').
        const user = await userModel.create({ ...profile, email, password });
        setAuthCookie(res, user, true);
        // toJSON в модела маха паролата, преди да изпратим потребителя.
        res.status(200).send(user);
    } catch (err) {
        // Зает имейл (409) и грешки от валидацията (400) се обработват в errorHandler.
        next(err);
    }
}

// POST /api/login — вход с имейл и парола.
async function login(req, res, next) {
    const email = cleanString(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const remember = Boolean(req.body.remember);

    try {
        const user = await userModel.findOne({ email });
        const match = user ? await user.matchPassword(password) : false;

        if (!match) {
            return res.status(401).send({ message: 'Грешен имейл или парола' });
        }

        setAuthCookie(res, user, remember);
        res.status(200).send(user);
    } catch (err) {
        next(err);
    }
}

// POST /api/logout — изход.
// Слагаме токена в "черен списък", за да не може да се ползва повече, и трием бисквитката.
async function logout(req, res) {
    const token = req.cookies[authCookieName];

    try {
        if (token) {
            await tokenBlacklistModel.create({ token });
        }
    } catch (err) {
        console.error(err);
    }

    // Бисквитката се трие само ако подадем същите настройки, с които е създадена.
    res.clearCookie(authCookieName, cookieOptions())
        .status(204)
        .end();
}

// GET /api/users/profile — данните на логнатия потребител.
// Клиентът вика това при зареждане на сайта, за да разбере дали вече има активна сесия.
function getProfileInfo(req, res) {
    // req.user е зареден от auth() middleware-а.
    res.status(200).json(req.user);
}

// PUT /api/users/profile — промяна на име, фамилия и телефон.
async function editProfileInfo(req, res, next) {
    const profile = pickProfile(req.body);

    const profileError = validateProfile(profile);
    if (profileError) {
        return res.status(400).send({ message: profileError });
    }

    try {
        const user = await userModel.findOneAndUpdate(
            { _id: req.user._id },
            profile,
            { runValidators: true, new: true }
        );
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    login,
    register,
    logout,
    getProfileInfo,
    editProfileInfo,
}
