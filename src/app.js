/**
 * This script contain the initialization
 * of the Join Code API.
 * @author Daniel Rodriguez
 */

const express = require('express');
require('./db/connectDb');
const app = express();

app.use(express.json());

module.exports = app;