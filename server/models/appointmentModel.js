const mongoose = require('mongoose');
const { isValidDate, isValidTime } = require('../utils/schedule');
const { PHONE_REGEX } = require('../utils/validators');

// Статуси на един записан час:
// booked    — записан (заема часа);
// cancelled — отменен (часът отново е свободен);
// completed — клиентът е дошъл;
// no_show   — клиентът не е дошъл.
const STATUSES = ['booked', 'cancelled', 'completed', 'no_show'];

// Един записан час при един бръснар.
const appointmentSchema = new mongoose.Schema({
    barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Липсва бръснар'],
    },
    // Клиентът с профил. Липсва, ако бръснарят е вписал човек ръчно (например обадил се по телефона).
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // Името и телефонът се копират в момента на записване — така бръснарят ги вижда,
    // дори клиентът после да си смени профила (или да няма профил).
    clientName: {
        type: String,
        trim: true,
        required: [true, 'Липсва име на клиента'],
        maxlength: [100, 'Името е твърде дълго'],
    },
    clientPhone: {
        type: String,
        trim: true,
        validate: {
            validator: (v) => !v || PHONE_REGEX.test(v),
            message: 'Невалиден телефонен номер',
        },
    },
    // Датата като текст "YYYY-MM-DD" (денят в София), както в WorkDay.
    date: {
        type: String,
        required: [true, 'Липсва дата'],
        validate: {
            validator: isValidDate,
            message: 'Датата трябва да е във формат YYYY-MM-DD',
        },
    },
    // Началният час: "HH:mm".
    time: {
        type: String,
        required: [true, 'Липсва час'],
        validate: {
            validator: isValidTime,
            message: 'Часът трябва да е във формат HH:mm',
        },
    },
    // Копие на услугата и цената в момента на записване (ако бръснарят после смени цената,
    // старите записвания остават с цената, на която са направени).
    service: {
        type: new mongoose.Schema({
            id: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
        }, { _id: false }),
    },
    status: {
        type: String,
        enum: {
            values: STATUSES,
            message: 'Невалиден статус',
        },
        default: 'booked',
    },
    // Кой е записал часа — клиентът или бръснарят.
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    cancelledAt: Date,
}, {
    timestamps: { createdAt: 'created_at' },
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});

// Защита от двойно записване: един бръснар не може да има два активни часа по едно и също време.
// Индексът важи само за status: 'booked' — отмененият час може да се запише отново.
// Базата проверява това атомарно, така че двама клиенти едновременно не могат да вземат един час.
appointmentSchema.index(
    { barber: 1, date: 1, time: 1 },
    { unique: true, partialFilterExpression: { status: 'booked' } }
);
// "Моите часове" на клиента.
appointmentSchema.index({ client: 1, date: 1 });
// Графикът на всички бръснари за деня/месеца (за собственика).
appointmentSchema.index({ date: 1, time: 1 });

const appointmentModel = mongoose.model('Appointment', appointmentSchema);
appointmentModel.STATUSES = STATUSES;

module.exports = appointmentModel;
