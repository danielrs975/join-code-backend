/**
 * This contains all the routes for the document
 * model
 * @author Daniel Rodriguez
 */
const express = require('express');
const router = new express.Router();

router.get('/documents', async (req, res) => {
	res.send('This is the router for documents');
});

module.exports = router;
