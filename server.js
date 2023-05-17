const express = require('express');
const app = express();
const emailRoutes = require('./routes/emailRoutes');
const bodyParser = require('body-parser');
const port = 3000;

console.log(`SEND_CONFIRMATION_MAIL is set to ${process.env.SEND_CONFIRMATION_MAIL}`)

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/email', emailRoutes);

app.use(function(req, res, next) {
  res.status(404).sendFile(__dirname + '/public/404/404.html');
});

app.listen(port, () => {
  console.log(`Server running on port ${port} || http://localhost:${port}`);
});
