/**
 * This contains all the routes for the document
 * model
 * @author Daniel Rodriguez
 */
const express = require('express');
const auth = require('../middlewares/auth');
const router = new express.Router();

const { createDocument, readDocument, shareDocument } = require('../controllers/document.controller');

/**
 * This route allow the user to create a document
 * Form of the body
 * {
 * 	"name": "Name of the document"
 * }
 */
router.post('/documents', auth, createDocument);

/**
 * This route allow the user to read a document
 * You can only read it if you are the owner or
 * you permission given from the owner
 */
router.get('/documents/:id', auth, readDocument);

/**
 * This route allow the user owner of a document
 * to share its document
 * Form of the body
 * {
 * 	users: [
 * 		"mongo id of the user 1",
 * 		....,
 * 		"mongo id of the user n"
 * 	]
 * }
 */
router.patch('/documents/:id/share', auth, shareDocument);

module.exports = router;
