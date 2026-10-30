const mongoose = require('mongoose');
const { isValidDate, isValidTime } = require('../utils/schedule');

// Един работен ден от графика на един бръснар.
const workDaySchema = new mongoose.Schema({
    barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Липсва бръснар'],
    },
    // Датата като текст "YYYY-MM-DD" (денят в София) — без часове и часови зони.
    date: {
        type: String,
        required: [true, 'Липсва дата'],
        validate: {
            validator: isValidDate,
            message: 'Датата трябва да е във формат YYYY-MM-DD',
        },
    },
    // Почивен ден — тогава slots е празен.
    dayOff: {
        type: Boolean,
        default: false,
    },
    // Началните часове, в които може да се запише клиент: ["10:00", "10:30", ...], подредени.
    slots: {
        type: [String],
        validate: {
            validator: (slots) => slots.every(isValidTime),
            message: 'Часовете трябва да са във формат HH:mm',
        },
    },
    note: {
        type: String,
        trim: true,
        maxlength: [200, 'Бележката е твърде дълга (най-много 200 символа)'],
        default: '',
    },
}, {
    timestamps: { createdAt: 'created_at' },
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});

// Всеки бръснар има най-много един запис за дадена дата.
workDaySchema.index({ barber: 1, date: 1 }, { unique: true });
// За собственика, който гледа графика на всички за месеца.
workDaySchema.index({ date: 1 });

module.exports = mongoose.model('WorkDay', workDaySchema);
