/**
 * This is the controllers for the document model
 */
const mongoose = require('mongoose');
const Document = require('../models/document');

/**
 * This method create a new document in the db
 * @param {*} req The request information
 * @param {*} res The response to the request
 */
const createDocument = async (req, res) => {
	const document = new Document({
		...req.body,
		owner : req.user._id,
		users : [ req.user._id ]
	});
	try {
		await document.save();
		res.send({ document });
	} catch (e) {
		res.status(500).send(e);
	}
};

/**
 * This controller retrieve a document to read it
 * @param {*} req The request information
 * @param {*} res The response of the request
 */
const readDocument = async (req, res) => {
	try {
		const document = await Document.findOne({
			_id   : req.params.id,
			users : mongoose.Types.ObjectId(req.user._id)
		});
		if (!document) {
			return res.status(404).send();
		}
		res.send({ document });
	} catch (e) {
		res.status(500).send(e);
	}
};

/**
 * This controller share a document to other users
 * @param {*} req The request information
 * @param {*} res The response to the request
 */
const shareDocument = async (req, res) => {
	try {
		let document = await Document.findOne({
			_id   : req.params.id,
			owner : mongoose.Types.ObjectId(req.user._id)
		});
		if (!document) {
			return res.status(403).send("You don't have permission to share this document");
		}
		document = await document.addUsers(req.body.users);
		res.send({ document });
	} catch (e) {
		res.status(500).send(e);
	}
};

module.exports = {
	createDocument,
	readDocument,
	shareDocument
};
