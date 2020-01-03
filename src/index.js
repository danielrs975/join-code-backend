/**
 * This is the initialization of the app itself.
 * In here we are going to start listening request from the
 * clients.
 * @author Daniel Rodriguez
 */

// ENV Configuration
require('dotenv').config();

// NPM Libraries
const http = require('http');
const socketio = require('socket.io');

// APP Files
const app = require('./app');

// Socket.io configuration
const http_server = http.createServer(app);
const socket_server = http.createServer(app);

const io = socketio(socket_server);

// ENV info
const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;

// This open a comunication directly between
// the server and the client. This connection permanent
// until the client disconnect
io.on('connection', (socket) => {
    // console.log("A new user arrived", socket.id);
    socket.on('disconnect', () => {});
})


// This is the server that going to receive all
// the http protocol request
http_server.listen(PORT, () => {
    console.log('Server is up in the port ' + PORT)
})

socket_server.listen(SOCKET_PORT, () => {
    console.log('Socket server is up in the port ' + SOCKET_PORT);
})
