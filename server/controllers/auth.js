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
            // Профил без парола -> създаден е с Google/Apple.
            const message = user && !user.password
                ? 'Този профил е създаден с Google или Apple. Влез с бутона по-долу.'
                : 'Грешен имейл или парола';
            return res.status(401).send({ message });
        }

        setAuthCookie(res, user, remember);
        res.status(200).send(user);
    } catch (err) {
        next(err);
    }
}

// Намира или създава потребител след успешен вход с Google/Apple.
//   providerField: 'googleId' или 'appleId'
//   providerId:    уникалното ID на потребителя при Google/Apple ("sub" в токена)
async function findOrCreateSocialUser({ providerField, providerId, email, emailVerified, firstName, lastName, providerName }) {
    // 1) Вече е влизал по този начин -> просто го връщаме.
    let user = await userModel.findOne({ [providerField]: providerId });
    if (user) {
        return user;
    }

    // 2) Има профил с имейл + парола със същия (потвърден от Google/Apple) имейл ->
    //    свързваме Google/Apple към него, вместо да правим втори профил.
    if (email && emailVerified) {
        user = await userModel.findOne({ email: email.toLowerCase() });
        if (user) {
            user[providerField] = providerId;
            user.firstName = user.firstName || firstName;
            user.lastName = user.lastName || lastName;
            return user.save();
        }
    }

    // 3) Нов потребител. Телефон още няма -> profileComplete ще е false
    //    и клиентът ще покаже екрана "Довърши регистрацията".
    if (!email) {
        throw utils.httpError(400, `${providerName} не ни предостави имейл. Опитай с друг начин на вход.`);
    }
    return userModel.create({
        email,
        firstName,
        lastName,
        [providerField]: providerId,
    });
}

// POST /api/login/google — тяло: { credential } (ID token от Google Identity Services).
async function googleLogin(req, res, next) {
    try {
        const payload = await utils.oauth.verifyIdToken('google', req.body.credential);

        const user = await findOrCreateSocialUser({
            providerName: 'Google',
            providerField: 'googleId',
            providerId: payload.sub,
            email: payload.email,
            emailVerified: payload.email_verified === true,
            // Имената от Google са само предложение — потребителят може да ги поправи после.
            firstName: payload.given_name,
            lastName: payload.family_name,
        });

        setAuthCookie(res, user, true);
        res.status(200).send(user);
    } catch (err) {
        next(err);
    }
}

// POST /api/login/apple — тяло: { idToken, firstName?, lastName? }.
// Apple слага в токена само имейла. Името идва отделно и САМО при първия вход,
// затова клиентът ни го препраща. Ако липсва — потребителят ще го въведе в "Довърши регистрацията".
async function appleLogin(req, res, next) {
    try {
        const payload = await utils.oauth.verifyIdToken('apple', req.body.idToken);

        const user = await findOrCreateSocialUser({
            providerName: 'Apple',
            providerField: 'appleId',
            providerId: payload.sub,
            email: payload.email,
            // Apple понякога праща email_verified като текст "true".
            emailVerified: payload.email_verified === true || payload.email_verified === 'true',
            firstName: cleanString(req.body.firstName) || undefined,
            lastName: cleanString(req.body.lastName) || undefined,
        });

        setAuthCookie(res, user, true);
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
// Ползва се от екрана "Довърши регистрацията" след вход с Google/Apple.
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
    googleLogin,
    appleLogin,
    logout,
    getProfileInfo,
    editProfileInfo,
}
