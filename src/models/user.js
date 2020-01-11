/**
 * This is the model for the user
 * @author Daniel Rodriguez
 */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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

UserSchema.pre('save', async function(next) {
	const user = this;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});

const User = mongoose.model('User', UserSchema);
