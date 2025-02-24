const express = require('express');
const app = express();
const router = require('./router');
const aRouter = require('./admin');
const path = require('path');
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, 'files')));
app.use('/', router);
app.use('/', aRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './files');

app.listen(PORT, () => {
    console.log(`Running on ${PORT}`)
});