const {
    userModel,
    tokenBlacklistModel
} = require('../models');

const crypto = require('crypto');
const utils = require('../utils');
const config = require('../config/config');
const { authCookieName } = require('../app-config');
const { cleanString, pickProfile, validateProfile } = utils.validators;

// Колко дни важи сесията. Браузърите не пазят бисквитка повече от ~400 дни, затова 365.
// Всеки път, когато потребителят отвори сайта, сесията се подновява за още 365 дни
// (виж getProfileInfo), така че който влиза поне веднъж годишно, остава логнат завинаги.
const SESSION_DAYS = 365;

// Настройки на бисквитката с токена.
// httpOnly: JavaScript в браузъра НЕ може да я прочете -> защита от XSS.
// В production клиентът и сървърът са на различни домейни, затова трябват sameSite: 'none' + secure.
function cookieOptions() {
    if (process.env.NODE_ENV === 'production') {
        return { httpOnly: true, sameSite: 'none', secure: true };
    }
    return { httpOnly: true };
}

// Създава наш JWT за потребителя и го записва в бисквитката за SESSION_DAYS дни.
// Бисквитката остава и след затваряне на браузъра — потребителят излиза само с бутона "Изход".
function setAuthCookie(res, user) {
    const token = utils.jwt.createToken({ id: user._id }, `${SESSION_DAYS}d`);
    res.cookie(authCookieName, token, {
        ...cookieOptions(),
        maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    });
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
        setAuthCookie(res, user);
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

    try {
        const user = await userModel.findOne({ email });
        const match = user ? await user.matchPassword(password) : false;

        if (!match) {
            return res.status(401).send({ message: 'Грешен имейл или парола' });
        }

        setAuthCookie(res, user);
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
// Клиентът вика това при всяко зареждане на сайта, за да разбере дали вече има активна сесия.
function getProfileInfo(req, res) {
    // Подновяваме сесията: нов токен и бисквитка за още SESSION_DAYS дни от днес.
    setAuthCookie(res, req.user);
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

// ---------- Забравена парола ----------

// Колко минути важи линкът от писмото.
const RESET_LINK_MINUTES = 60;
// Колко минути трябва да минат, преди да пратим ново писмо на същия имейл
// (за да не може някой да залее чужда поща с писма).
const RESET_COOLDOWN_MINUTES = 2;

// Кодът от линка го пазим в базата само като SHA-256 хеш.
function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// POST /api/forgot-password — тяло: { email }.
// Ако има такъв потребител, генерира еднократен код и праща писмо с линк за нова парола.
async function forgotPassword(req, res, next) {
    const email = cleanString(req.body.email).toLowerCase();
    // Винаги връщаме едно и също съобщение — иначе всеки би могъл да проверява
    // дали даден имейл е регистриран при нас.
    const message = 'Ако има профил с този имейл, изпратихме ти линк за нова парола. Провери пощата си (и папка Спам).';

    if (!email) {
        return res.status(400).send({ message: 'Въведи имейл' });
    }

    try {
        const user = await userModel.findOne({ email });

        // Писмо пращаме само ако има потребител и не сме му пратили друго преди малко.
        const lastSentAt = user && user.resetPasswordExpires
            ? user.resetPasswordExpires.getTime() - RESET_LINK_MINUTES * 60 * 1000
            : 0;
        const canSend = user && Date.now() - lastSentAt > RESET_COOLDOWN_MINUTES * 60 * 1000;

        if (canSend) {
            // 32 случайни байта -> 64 знака. Невъзможно е да се познае.
            const token = crypto.randomBytes(32).toString('hex');

            // updateOne вместо save(), за да не пускаме валидацията на целия профил.
            await userModel.updateOne({ _id: user._id }, {
                resetPasswordHash: hashResetToken(token),
                resetPasswordExpires: new Date(Date.now() + RESET_LINK_MINUTES * 60 * 1000),
            });

            const link = `${config.clientUrl}/reset-password?token=${token}`;
            const mail = utils.emails.resetPasswordEmail({ firstName: user.firstName, link, minutes: RESET_LINK_MINUTES });

            try {
                await utils.mailer.sendMail({ to: user.email, ...mail });
            } catch (err) {
                // Не казваме на клиента, че писмото не е тръгнало (пак би издало, че имейлът съществува),
                // но го пишем в конзолата, за да го видиш.
                console.error('Писмото за нова парола не е изпратено:', err.message);
            }
        }

        res.status(200).send({ message });
    } catch (err) {
        next(err);
    }
}

// POST /api/reset-password — тяло: { token, password, rePassword }.
// Проверява кода от линка, записва новата парола и логва потребителя.
async function resetPassword(req, res, next) {
    const token = cleanString(req.body.token);
    const { password, rePassword } = req.body;

    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).send({ message: 'Паролата трябва да е поне 6 символа' });
    }
    if (password !== rePassword) {
        return res.status(400).send({ message: 'Паролите не съвпадат' });
    }

    try {
        // Търсим потребител със същия хеш на кода и неизтекъл срок.
        const user = token && await userModel.findOne({
            resetPasswordHash: hashResetToken(token),
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).send({ message: 'Линкът е невалиден или е изтекъл. Поискай нов.' });
        }

        // Новата парола се хешира автоматично в userModel (pre 'save').
        user.password = password;
        // Изтриваме кода -> линкът не може да се ползва втори път.
        user.resetPasswordHash = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Логваме го директно, за да не въвежда новата парола веднага пак.
        setAuthCookie(res, user);
        res.status(200).send(user);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    getProfileInfo,
    editProfileInfo,
}
