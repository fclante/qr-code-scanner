const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/index'); // Import the routes

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes); // Use the routes

app.listen(3000, () => console.log('Server running on http://localhost:3000'));