/**
 * This contains all the routes for the user routes
 * @author Daniel Rodriguez
 */

const express = require('express');
const router = new express.Router();

router.get('/users', async (req, res) => {
	res.send('This is the router for users');
});

module.exports = router;
