const ot = require('ot');
const fs = require('fs');
const path = require('path');
const Document = require('./models/document');
const { term } = require('./app');

const {
	removeUserOfDoc,
	getUsersOfDoc,
	addUserToDoc,
	getDoc,
	transformOperation,
	getUserAndSaveCoords
} = require('./utils/document');

module.exports = (io) => {
	io.on('connection', (socket) => {
		// console.log("A new user arrived", socket.id);

		socket.on('join', async (userInfo, callback) => {
			const { err, user } = addUserToDoc({ ...userInfo, socketId: socket.id });
			if (err) callback({ err });
			const doc = await getDoc(user.docId);
			socket.join(user.docId);
			// In the callback we going to send back the info of the users connected
			// This is important to send the information of the cursor pos
			socket.to(user.docId).broadcast.emit('notification', {
				type : 'join',
				msg  : 'A new user has joined',
				info : { users: getUsersOfDoc(null, user.docId) }
			});
			const users = getUsersOfDoc(user.socketId, user.docId);
			callback({ doc, socketId: user.socketId, users });
		});

		socket.on('operation', async ({ operation, meta }, callback) => {
			const doc = await getDoc(meta.docId);
			console.log(operation, meta, doc.content.length);
			let OPERATIONPROCESSED = true;
			operation = ot.TextOperation.fromJSON(operation);
			// console.log(operation, meta);

			// This is the area that concern to the user that the operation came from
			// In here we are going to process
			//		the operation on the server
			//		document
			try {
				// In this space we are going to see if the version of the incoming op
				// is the same that the server version
				// console.log(meta);
				if (meta.version < doc.version) {
					console.log('You have to take in account the older operations');
					operation = transformOperation({ operation, meta }, doc);
					// console.log(operation);
					// return;
				}

				// const response = await applyOperation({ operation, meta }, doc);
				// console.log(response);
				console.log(doc.content.length, meta);
				doc.content = operation.apply(doc.content);
				doc.operations.push({ operation, meta });
				doc.version += 1;
				await Document.findByIdAndUpdate(meta.docId, { content: doc.content });
			} catch (e) {
				console.log('Error: ', e);
				OPERATIONPROCESSED = false;
			}
			// Send an aknowlegmentd to the user that the operation
			// is complete
			if (!OPERATIONPROCESSED) return callback(OPERATIONPROCESSED, doc); // If the operation is not processed then we return
			io.to(meta.docId).emit('changeVersion', doc);
			socket.to(meta.docId).broadcast.emit('operation', operation);
			getUserAndSaveCoords(socket.id, meta.docId, meta.cursorPos);
			socket.to(meta.docId).broadcast.emit('notification', {
				type : 'pos',
				msg  : 'There was a change in the other cursors',
				info : { users: getUsersOfDoc(null, meta.docId) }
			});
			callback(OPERATIONPROCESSED);

			// -----------------------------------------------------------------------

			// In here we have to send all the operations to the other users
			// In the meanwhile we are going to send the copy of all the doc
			// In the future we send the operation
		});

		socket.on('runPython', async (docId) => {
			const doc = await getDoc(docId);
			let file_name = __dirname + '/' + doc.name;
			console.log(file_name);
			let file_content = doc.content;

			let stream = fs.createWriteStream(file_name);
			stream.once('open', function() {
				stream.write(file_content);
				stream.end();
			});
			term['1'].write(`python3 ${file_name}\n`);
		});

		socket.on('runC', async (docId) => {
			const doc = await getDoc(docId);
			let file_name = __dirname + '/' + doc.name;
			console.log(file_name);
			let file_content = doc.content;

			let stream = fs.createWriteStream(file_name);
			stream.once('open', function() {
				stream.write(file_content);
				stream.end();
			});
			term['1'].write(`gcc ${file_name} -o tmp\n`);
			term['1'].write(`./tmp\n`);
		});

		socket.on('runJava', async (docId) => {
			const doc = await getDoc(docId);
			let file_name = __dirname + '/' + doc.name;
			console.log(file_name);
			let file_content = doc.content;

			let stream = fs.createWriteStream(file_name);
			stream.once('open', function() {
				stream.write(file_content);
				stream.end();
			});

			term['1'].write(`javac -d . ${file_name}\n`);
			term['1'].write(`java ${doc.name.split(".")[0]}\n`);
		});

		socket.on('disconnect', () => {
			const user = removeUserOfDoc(socket.id);
			if (user) {
				io
					.to(user.docId)
					.emit('notification', { type: 'left', msg: `User ${user.socket_id} has left!!`, info: { user } });
				io.to(user.docId).emit('user-leave', { users: getUsersOfDoc(null, user.docId), userRemoved: user });
			}
		});
	});
};
