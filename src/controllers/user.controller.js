/**
 * This is the controller for the user model
 * @author Daniel Rodriguez
 */

const User = require('../models/user');

/**
 * This controller create a new user in the db
 * @param {*} req The request information
 * @param {*} res The response to the request
 */
const userSignup = async (req, res) => {
	const user = new User(req.body);

	try {
		await user.save();
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (e) {
		res.status(500).send(e);
	}
};

/**
 * This controller login a user to the app
 * @param {*} req Info about the request
 * @param {*} res The response to the request
 */
const userLogin = async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		res.send({
			user,
			token
		});
	} catch (e) {
		res.status(400).send();
	}
};

/**
 * This controller logout a user logged
 * @param {*} req The request information
 * @param {*} res The response to the request
 */
const userLogout = async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send();
	}
};

/**
 * This controller retrieve all the documents of the user. Share and
 * not share
 * @param {*} req The request information
 * @param {*} res The response of the request
 */
const userDocuments = async (req, res) => {
	try {
		await req.user.populate('documents').execPopulate();
		await req.user.populate('sharedDocuments').execPopulate();

		res.send({
			documents       : req.user.documents,
			sharedDocuments : req.user.sharedDocuments.filter(
				(document) => !req.user.documents.find((document_2) => document.name === document_2.name)
			)
		});
	} catch (e) {
		res.status(500).send(e);
	}
};

module.exports = {
	userSignup,
	userLogin,
	userLogout,
	userDocuments
};
