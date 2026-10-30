// Създава (или обновява) профилите на собственика и бръснарите.
// Пускане: npm run seed  (от папка server/)
//
// Данните са в .env: SEED_OWNER_*, SEED_BARBER1_*, SEED_BARBER2_* (виж .env.example).
// - Ако имейлът вече е регистриран -> само му слагаме ролята (паролата и името остават).
// - Ако го няма -> създаваме профил с паролата от .env.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const dbConnector = require('../config/db');
const { userModel } = require('../models');

const ACCOUNTS = [
    { prefix: 'SEED_OWNER', role: 'owner', firstName: 'Собственик', lastName: 'TrapBlade' },
    { prefix: 'SEED_BARBER1', role: 'barber', firstName: 'Бръснар', lastName: 'Първи' },
    { prefix: 'SEED_BARBER2', role: 'barber', firstName: 'Бръснар', lastName: 'Втори' },
];

function readAccount({ prefix, role, firstName, lastName }) {
    const env = (name) => (process.env[`${prefix}_${name}`] || '').trim();
    return {
        prefix,
        role,
        email: env('EMAIL').toLowerCase(),
        password: process.env[`${prefix}_PASSWORD`] || '',
        firstName: env('FIRST_NAME') || firstName,
        lastName: env('LAST_NAME') || lastName,
    };
}

async function seedAccount(account) {
    const { prefix, role, email, password, firstName, lastName } = account;
    const existing = await userModel.findOne({ email });

    if (existing) {
        // updateOne, за да не пускаме валидацията на целия профил и да не пипаме паролата.
        await userModel.updateOne({ _id: existing._id }, { role });
        console.log(`✔ ${email} вече съществува — ролята е ${role}`);
        return;
    }

    if (password.length < 6) {
        throw new Error(`${email} не съществува, а ${prefix}_PASSWORD липсва или е по-къса от 6 символа`);
    }

    // Паролата се хешира автоматично в userModel (pre 'save').
    await userModel.create({ email, password, firstName, lastName, role });
    console.log(`+ Създаден ${role}: ${email}`);
}

async function main() {
    const accounts = ACCOUNTS.map(readAccount);

    // Проверяваме .env, преди да се свързваме с базата.
    accounts.forEach(({ prefix, email }) => {
        if (!email) {
            throw new Error(`Липсва ${prefix}_EMAIL в .env`);
        }
    });
    const emails = accounts.map((account) => account.email);
    if (new Set(emails).size !== emails.length) {
        throw new Error('Имейлите на собственика и бръснарите трябва да са различни');
    }

    await dbConnector();
    try {
        for (const account of accounts) {
            await seedAccount(account);
        }
    } finally {
        await mongoose.disconnect();
    }
}

main()
    .then(() => console.log('Готово.'))
    .catch((err) => {
        console.error('Грешка:', err.message);
        process.exitCode = 1;
    });
