const ot = require('ot');
const {
	docs,
	addUserToDoc,
	removeUserOfDoc,
	getUserAndSaveCoords,
	getUsersOfDoc,
	getUser,
	createOperation
} = require('./utils/document');

let userOps = {};

module.exports = (io) => {
	io.on('connection', (socket) => {
		// console.log("A new user arrived", socket.id);

		socket.on('join', (options, callback) => {
			// First we add the user to the document
			const { error, user } = addUserToDoc({ socket_id: socket.id, ...options });
			if (error) {
				return;
			}
			socket.join(user.docId);
			socket.to(user.docId).broadcast.emit('notification', `User ${user.socket_id} has joined!`);
			userOps[socket.id] = [];
			const doc = docs.find((doc) => doc._id === user.docId);
			socket.emit('sendDoc', doc);
			callback(socket.id);
			socket.emit('user-new-position', getUsersOfDoc(null, user.docId));
		});

		// Documents events
		socket.on('save', ({ operation, docId, createdAt }) => {
			const doc = docs.find((document) => document._id === docId);
			let op = ot.TextOperation.fromJSON(operation);

			let transformedOp;
			doc.operations.forEach((opMade) => {
				if (op.baseLength === opMade.baseLength) {
					transformedOp = ot.TextOperation.transform(op, opMade);
				}
			});
			console.log(transformedOp);
			if (transformedOp) {
				socket.emit('change', { op: transformedOp[1], createdAt });
				socket.to(doc._id).broadcast.emit('change', { op: transformedOp[0], createdAt });
			} else {
				socket.to(doc._id).broadcast.emit('change', { op, createdAt });
			}
			doc.operations.push(op);
		});

		socket.on('update-cursor-position', ({ docId, coords }) => {
			const user = getUserAndSaveCoords(socket.id, docId, coords);
			if (user) {
				socket.to(user.docId).broadcast.emit('user-new-position', getUsersOfDoc(null, docId));
			}
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
