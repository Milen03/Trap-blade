const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { PHONE_REGEX } = require('../utils/validators');
const saltRounds = Number(process.env.SALTROUNDS) || 5;

// Профилът е "завършен", когато имаме име, фамилия и телефон.
// При вход с Google/Apple потребителят се създава без телефон (а понякога и без имена),
// затова клиентът го праща на екрана "Довърши регистрацията", докато това не стане true.
function isProfileComplete(user) {
    return Boolean(user.firstName && user.lastName && user.phone);
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Имейлът е задължителен'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    // Паролата е задължителна само за потребители с имейл + парола.
    // Който влиза с Google или Apple, няма парола при нас.
    password: {
        type: String,
        required: [
            function () { return !this.googleId && !this.appleId; },
            'Паролата е задължителна',
        ],
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
    // Уникалните ID-та, които Google/Apple ни дават за потребителя ("sub" в токена).
    // sparse: true -> уникалността важи само за документите, които имат това поле.
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    appleId: {
        type: String,
        unique: true,
        sparse: true,
    },
}, {
    timestamps: { createdAt: 'created_at' },
    // Когато пращаме потребителя като JSON към клиента:
    // - добавяме виртуалното поле profileComplete;
    // - махаме паролата (хеша) и __v, за да не излизат никога навън.
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.__v;
            delete ret.id;
            return ret;
        },
    },
});

// Виртуално поле: не се пази в базата, изчислява се при всяко четене.
userSchema.virtual('profileComplete').get(function () {
    return isProfileComplete(this);
});

userSchema.methods = {
    matchPassword: function (password) {
        // Потребител от Google/Apple няма парола -> входът с парола винаги е неуспешен.
        if (!this.password) {
            return Promise.resolve(false);
        }
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
