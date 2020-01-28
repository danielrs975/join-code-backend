/**
 * This script is in charge to connect our API
 * to the database
 */

const mongoose = require('mongoose');
const dbUrl = process.env.MONGODB_URL;

mongoose.connect(
	dbUrl,
	{
		useNewUrlParser    : true,
		useCreateIndex     : true,
		useUnifiedTopology : true
	},
	(err) => {
		if (err) {
			return console.log(err);
		}
		console.log('DB is connected');
	}
);
