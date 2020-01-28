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

app.ws('/', function(ws, req) {
	shell = 'bash';
	if (!term['1']) {
		term['1'] = pty.spawn(shell, [], {
			name : 'xterm-color',
			cwd  : process.env.PWD,
			env  : process.env
		});
	}
	term['1'].on('data', (data) => {
		// console.log(data);
		ws.send(data);
	});

	ws.on('message', (msg) => {
		term['1'].write('python3 hello.py\n');
	});
});

app.use(userRoutes);
app.use(docRoutes);

module.exports = {
	app,
	term
};
