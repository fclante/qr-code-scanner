const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const routes = require('./routes/index'); // Import the routes
const session = require('express-session');

const app = express();

// Add the layout middleware before other middleware
app.use(expressLayouts);

// Add static file serving middleware with proper MIME types
app.use(express.static(path.join(__dirname, '../public')));

// Add a specific route for CSS files
app.get('*.css', (req, res, next) => {
  res.type('text/css');
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout'); // Set the default layout

// Move these BEFORE the routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Add currentPath middleware
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use('/', routes); // Use the routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Frontend server running on http://localhost:${PORT}`));