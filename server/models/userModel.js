const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { PHONE_REGEX } = require('../utils/validators');
// Колко "тежко" е хеширането с bcrypt (2^10 повторения). Повече = по-трудно за разбиване,
// но и по-бавен вход. 10 е препоръчителният минимум. Старите хешове с 5 продължават да работят.
const saltRounds = Number(process.env.SALTROUNDS) || 10;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Имейлът е задължителен'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Паролата е задължителна'],
        minlength: [6, 'Паролата трябва да е поне 6 символа'],
    },
    firstName: {
        type: String,
        trim: true,
        maxlength: [50, 'Името е твърде дълго'],
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Фамилията е твърде дълга'],
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: (v) => !v || PHONE_REGEX.test(v),
            message: 'Невалиден телефонен номер',
        },
    },
    // Версия на сесиите. Всеки токен я носи; при "Изход" се увеличава с 1
    // и всички по-стари токени спират да важат (виж utils/auth.js).
    tokenVersion: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: { createdAt: 'created_at' },
    // Когато пращаме потребителя като JSON към клиента,
    // махаме паролата (хеша), tokenVersion и __v — клиентът няма нужда от тях.
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.tokenVersion;
            delete ret.__v;
            return ret;
        },
    },
});

userSchema.methods = {
    matchPassword: function (password) {
        return bcrypt.compare(password, this.password);
    }
}

// Преди запис: ако паролата е нова/сменена, я хешираме с bcrypt.
// В базата никога не пазим паролата в чист вид.
userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
                return next(err);
            }
            bcrypt.hash(this.password, salt, (err, hash) => {
                if (err) {
                    return next(err);
                }
                this.password = hash;
                next();
            })
        })
        return;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
