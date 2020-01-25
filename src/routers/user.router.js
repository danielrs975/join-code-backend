/**
 * This contains all the routes for the user routes
 * @author Daniel Rodriguez
 */

const express = require('express');
const router = new express.Router();
const auth = require('../middlewares/auth');
const {
	userSignup,
	userLogin,
	userLogout,
	userDocuments,
	userProfile,
	getUser
} = require('../controllers/user.controller');

/**
 * This router is for create a new user to the app
 * form of the request body
 * {
 * 	"name": "Some name",
 *  "email": "Some valid email",
 *  "password": "Some password"
 * }
 */
router.post('/users/signup', userSignup);

/**
 * This router is to login a user to the app
 * Form of the request body
 * {
 * 	 "email": "some email",
 * 	 "password": "some password"
 * }
 */
router.post('/users/login', userLogin);

/**
 * This router is to logout a user of the app
 * There is no body for this request. The body is empty {}
 */
router.post('/users/logout', auth, userLogout);

/**
 * This router is to retrieve all the documents that the user
 * is involved
 */
router.get('/users/me/documents', auth, userDocuments);

/**
 * This route if for retrieve my profile info
 */
router.get('/users/me/profile', auth, userProfile);

/**
 * This route get an especific user using its email
 */
router.get('/users', auth, getUser);

module.exports = router;
