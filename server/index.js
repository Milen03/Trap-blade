global.__basedir = __dirname;
require('dotenv').config()
const dbConnector = require('./config/db');
// const mongoose = require('mongoose');
const apiRouter = require('./router');
const cors = require('cors');
// const config = require('./config/config');
const { errorHandler } = require('./utils');
const { userModel } = require('./models');

dbConnector()
  // Привеждаме индексите на колекцията users в синхрон със схемата.
  // Старият модел имаше уникално поле username; ако индексът му остане в базата,
  // всеки нов потребител без username ще дава грешка "вече съществува".
  .then(() => userModel.syncIndexes())
  .then(() => {
    const config = require('./config/config');

    const app = require('express')();
    require('./config/express')(app);

    app.use(cors({
      origin: config.origin,
      credentials: true
    }));

    app.use('/api', apiRouter);

    app.use(errorHandler);

    app.listen(config.port, console.log(`Listening on port ${config.port}!`));
  })
  .catch(console.error);
