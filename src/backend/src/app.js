const express = require('express');
const bodyParser = require('body-parser');
const setRoutes = require('./routes/index');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add /api prefix to all routes
app.use('/api', (req, res, next) => {
    setRoutes(express.Router())(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});