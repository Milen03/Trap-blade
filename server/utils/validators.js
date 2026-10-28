// Позволени символи в телефона: цифри, интервали, тирета, скоби и "+" отпред.
// Пример: "0888 123 456" или "+359 888 123 456".
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

// Превръща стойност от req.body в изчистен текст.
// Ако някой прати число, обект и т.н. вместо текст, получаваме празен низ —
// така { "$ne": null } не може да се промъкне в заявка към базата.
function cleanString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

// Взима само полетата на профила от тялото на заявката.
function pickProfile(body) {
    return {
        firstName: cleanString(body.firstName),
        lastName: cleanString(body.lastName),
        phone: cleanString(body.phone),
    };
}

// Проверява името, фамилията и телефона (вече изчистени с pickProfile).
// Използва се и при регистрация, и при "Довърши регистрацията".
// Връща текст на грешката (на български) или null, ако всичко е наред.
function validateProfile({ firstName, lastName, phone }) {
    if (!firstName) {
        return 'Името е задължително';
    }
    if (!lastName) {
        return 'Фамилията е задължителна';
    }
    if (!phone) {
        return 'Телефонът е задължителен';
    }
    if (!PHONE_REGEX.test(phone)) {
        return 'Невалиден телефонен номер';
    }
    return null;
}

module.exports = {
    PHONE_REGEX,
    cleanString,
    pickProfile,
    validateProfile,
}
