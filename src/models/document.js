/**
 * This is the model for the document
 * @author Daniel Rodriguez
 */
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
	{
		owner   : {
			type     : mongoose.Schema.Types.ObjectId,
			required : true,
			ref      : 'User'
		},
		content : {
			type    : String,
			default : ''
		},
		name    : {
			type     : String,
			required : true,
			unique   : true,
			trim     : true
		},
		users   : {
			type    : Array,
			default : []
		}
	},
	{
		timestamps : true
	}
);

DocumentSchema.methods.addUsers = async function(users) {
	const document = this;
	document.users = document.users.concat(users.map((user) => mongoose.Types.ObjectId(user)));
	await document.save();
	return document;
};

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;
