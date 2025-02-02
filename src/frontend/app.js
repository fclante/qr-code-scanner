const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const routes = require('./routes/index'); // Import the routes

const app = express();

// Add the layout middleware before other middleware
app.use(expressLayouts);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout'); // Set the default layout

// Move these BEFORE the routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routes); // Use the routes

app.listen(3000, () => console.log('Server running on http://localhost:3000'));