/**
 * This script contain the initialization
 * of the Join Code API.
 * @author Daniel Rodriguez
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

app.ws('/', function(ws, req) {
	let shell = 'bash';
	let term = pty.spawn(shell, [], {
		name : 'xterm-color',
		cwd  : process.env.PWD,
		env  : process.env
	});

	term.on('data', (data) => {
		// console.log(data);
		ws.send(data);
	});

	ws.on('message', (msg) => {
		console.log(msg);
		term.write('python3 hello.py\n');
	});
});

app.use(userRoutes);
app.use(docRoutes);

module.exports = app;
