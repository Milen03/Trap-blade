const config = require('./config');
const mongoose = require('mongoose');

// Mongoose 8 вече няма нужда от старите опции (useNewUrlParser, useCreateIndex...) —
// поведението им е по подразбиране, а драйверът дава грешка, ако ги подадеш.
module.exports = () => mongoose.connect(config.dbURL);
