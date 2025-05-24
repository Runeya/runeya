// @ts-ignore
require('express-async-errors');
const { express } = require('@runeya/common-express');
const indexRouter = require('./routes/index');

const app = express();

app.use('/', indexRouter);

module.exports = app;
