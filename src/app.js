require('dotenv').config();

const path = require('path');
const express = require('express');

const {
  PORT: port = 3000,
} = process.env;

const registration = require('./registration');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

function notFoundHandler(req, res) {
  const title = 'Fannst ekki';
  const message = 'Ó nei, efnið finnst ekki';
  res.status(404).render('error', { title, message });
}
// eslint-disable-next-line
function errorHandler(err, req, res, next) {
  console.error(err);
  const title = 'Villa kom upp';
  const message = err.toString();
  res.status(500).render('error', { title, message });
}

app.use('/', registration);

app.use(notFoundHandler);
app.use(errorHandler);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
