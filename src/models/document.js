/**
 * This is the model for the document
 * @author Daniel Rodriguez
 */
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
	{
		owner   : {
			type     : mongoose.Types.ObjectId,
			ref      : 'User',
			required : true
		},
		content : {
			type    : String,
			default : ''
		},
		name    : {
			type     : String,
			required : true
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

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;
