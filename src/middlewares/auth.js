/**
 * This is the middleware to verify if a user is logged
 */
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * This middleware verify if a user is logged to the app
 * before making the actual request
 * @param {*} req The request information
 * @param {*} res The response of the request
 * @param {*} next Is callback that we call when all is good with the request
 */
const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
		if (!user) {
			throw new Error();
		}

		req.token = token;
		req.user = user;
		next();
	} catch (e) {
		res.status(401).send({ error: 'Please authenticate' });
	}
};

module.exports = auth;
