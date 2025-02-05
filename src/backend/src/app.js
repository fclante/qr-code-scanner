const express = require('express');
const bodyParser = require('body-parser');
const setRoutes = require('./routes/index');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a router for /api routes
const apiRouter = express.Router();
app.use('/api', setRoutes(apiRouter));

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend server running on port ${PORT}`));
