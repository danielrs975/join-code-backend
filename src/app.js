/**
 * This script contain the initialization
 * of the Join Code API.
 */

const express = require('express');
const cors = require('cors');
const pty = require('node-pty');

const userRoutes = require('./routers/user.router');
const docRoutes = require('./routers/document.router');
require('./db/connectDb');
const app = express();

require('express-ws')(app);

app.use(express.json());
app.use(cors());
var shell;
let term = {};
let usersConnected = 0;

app.ws('/', function(ws, req) {
	shell = 'bash';
	if (!term['1']) {
		term['1'] = pty.spawn(shell, [], {
			name : 'xterm-color',
			cwd  : process.env.PWD,
			env  : process.env
		});
	}
	usersConnected++;
	term['1'].on('data', (data) => {
		ws.send(data);
	});

	ws.on('close', () => {
		console.log(usersConnected);
		usersConnected--;
		if (usersConnected == 0) {
			term['1'].kill();
			delete term['1'];
		}
	});
});

app.use(userRoutes);
app.use(docRoutes);

module.exports = {
	app,
	term
};
