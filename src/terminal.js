const pty = require('node-pty');
const ws = require('express-ws');
let shell = 'bash';
let term = pty.spawn(shell, [], {
	name : 'xterm-color',
	cwd  : process.env.PWD,
	env  : process.env
});

term.on('data', (data) => {
	console.log(data);
	// ws.send(data);
});

term.on('message', (msg) => {
	console.log(msg);
	// term.write(msg);
});
