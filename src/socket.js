const ot = require('ot');
const { removeUserOfDoc, getUsersOfDoc, addUserToDoc, getDoc, transformOperation } = require('./utils/document');

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

		socket.on('operation', async ({ operation, meta }, callback) => {
			const doc = getDoc(meta.docId);
			console.log(operation, meta);
			let OPERATIONPROCESSED = true;
			operation = ot.TextOperation.fromJSON(operation);
			// console.log(operation, meta);

			// This is the area that concern to the user that the operation came from
			// In here we are going to process
			//		the operation on the server
			//		document
			setTimeout(async () => {
				try {
					// In this space we are going to see if the version of the incoming op
					// is the same that the server version
					// console.log(meta);
					let transOp;
					if (meta.version < doc.version) {
						console.log('You have to take in account the older operations');
						operation = transformOperation({ operation, meta }, doc);
						// console.log(operation);
						// return;
					}

					// const response = await applyOperation({ operation, meta }, doc);
					// console.log(response);
					doc.content = operation.apply(doc.content);

					doc.operations.push({ operation, meta });
					doc.version += 1;
				} catch (e) {
					console.log('Error: ', e);
					OPERATIONPROCESSED = false;
				}
				// Send an aknowlegmentd to the user that the operation
				// is complete
				if (!OPERATIONPROCESSED) return callback(OPERATIONPROCESSED); // If the operation is not processed then we return
				socket.to(meta.docId).broadcast.emit('experimentalOp', operation);
				io.to(meta.docId).emit('operation', doc);
				callback(OPERATIONPROCESSED);
			}, 50);

			// -----------------------------------------------------------------------

			// In here we have to send all the operations to the other users
			// In the meanwhile we are going to send the copy of all the doc
			// In the future we send the operation
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
