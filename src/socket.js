const ot = require('ot');
const { removeUserOfDoc, getUsersOfDoc, addUserToDoc, getDoc, docs } = require('./utils/document');

let userOps = {};

module.exports = (io) => {
	io.on('connection', (socket) => {
		// console.log("A new user arrived", socket.id);

		socket.on('join', (userInfo, callback) => {
			const { err, user } = addUserToDoc({ ...userInfo, socketId: socket.id });
			if (err) callback({ err });
			const doc = getDoc(user.docId);
			socket.join(user.docId);
			// In the callback we going to send back the info of the users connected
			socket.to(user.docId).emit('notification', 'A new user has joined');
			callback({ doc, socketId: user.socketId });
		});

		socket.on('operation', ({ operation, meta }, callback) => {
			const doc = getDoc(meta.docId);
			let OPERATIONPROCESSED = true;
			operation = ot.TextOperation.fromJSON(operation);
			// console.log(operation);

			// This is the area that concern to the user that the operation came from
			// In here we are going to process
			//		the operation on the server
			//		document
			try {
				doc.content = operation.apply(doc.content);
				doc.operations.push({ operation, meta });
				doc.version += 1;
				console.log(docs[0]);
			} catch (e) {
				console.log('Error: ', e);
				OPERATIONPROCESSED = false;
			}
			// Send an aknowlegmentd to the user that the operation
			// is complete

			callback(OPERATIONPROCESSED);
			if (!OPERATIONPROCESSED) return; // If the operation is not processed then we return
			// -----------------------------------------------------------------------

			// In here we have to send all the operations to the other users
			// In the meanwhile we are going to send the copy of all the doc
			// In the future we send the operation
			socket.to(meta.docId).broadcast.emit('operation', doc);
		});

		socket.on('disconnect', () => {
			const user = removeUserOfDoc(socket.id);
			if (user) {
				io.to(user.docId).emit('notification', `User ${user.socket_id} has left!!`);
				io.to(user.docId).emit('user-leave', { users: getUsersOfDoc(null, user.docId), userRemoved: user });
			}
		});
	});
};
