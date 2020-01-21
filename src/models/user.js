/**
 * This is the model for the user
 * @author Daniel Rodriguez
 */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
	{
		name     : {
			type     : String,
			required : true,
			trim     : true
		},
		email    : {
			type     : String,
			required : true,
			unique   : true,
			validate(value) {
				if (!validator.isEmail(value)) throw new Error('Email is invalid');
			}
		},
		password : {
			type     : String,
			required : true,
			trim     : true
		},
		tokens   : [
			{
				token : {
					type     : String,
					required : true
				}
			}
		]
	},
	{
		timestamps : true
	}
);

// UserSchema.set('toJSON', { virtuals: true });
// UserSchema.set('toObject', { virtuals: true });

UserSchema.virtual('documents', {
	ref          : 'Document',
	localField   : '_id',
	foreignField : 'owner'
});

UserSchema.virtual('sharedDocuments', {
	ref          : 'Document',
	localField   : '_id',
	foreignField : 'users'
});

/**
 * Method to generate an authtoken when a user login
 */
UserSchema.methods.generateAuthToken = async function() {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
};

UserSchema.methods.toJSON = function() {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;

	return userObject;
};
/**
 * This find a user by its credential
 * @param email The email of the user
 * @param password the password of the user
 */
UserSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) {
		throw new Error('Unable to login');
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) throw new Error('Unable to login');

	return user;
};

UserSchema.pre('save', async function(next) {
	const user = this;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
