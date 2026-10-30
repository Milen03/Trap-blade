const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { PHONE_REGEX } = require('../utils/validators');
const saltRounds = Number(process.env.SALTROUNDS) || 5;

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
    // Роля: client (клиент), barber (бръснар), owner (собственик).
    // При регистрация винаги е client — роля се дава само от scripts/seed.js.
    role: {
        type: String,
        enum: {
            values: ['client', 'barber', 'owner'],
            message: 'Невалидна роля',
        },
        default: 'client',
    },
    // "Забравена парола": хеш на кода от линка в писмото и до кога е валиден.
    // Пазим само хеша (SHA-256) — ако някой види базата, от него не може да направи работещ линк.
    resetPasswordHash: String,
    resetPasswordExpires: Date,
}, {
    timestamps: { createdAt: 'created_at' },
    // Когато пращаме потребителя като JSON към клиента,
    // махаме паролата (хеша), данните за смяна на парола и __v, за да не излизат никога навън.
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.resetPasswordHash;
            delete ret.resetPasswordExpires;
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
