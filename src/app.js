/**
 * This script contain the initialization
 * of the Join Code API.
 * @author Daniel Rodriguez
 */

const express = require('express');
const cors = require('cors');
const userRoutes = require('./routers/user.router');
const docRoutes = require('./routers/document.router');
require('./db/connectDb');
const app = express();

app.use(express.json());
app.use(cors());
app.use(userRoutes);
app.use(docRoutes);

module.exports = app;
