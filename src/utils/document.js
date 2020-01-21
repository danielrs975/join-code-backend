const ot = require('ot');
const EventEmitter = require('events');
// This docs constant is going to represent
// the docs that are currently loaded and being modify
const docs = [
	{
		_id          : '123',
		modifyAt     : new Date(),
		content      : '',
		operations   : [],
		version      : 0,
		opOnGoing    : undefined,
		eventEmitter : new EventEmitter()
	},
	{
		_id        : '1234',
		modifyAt   : new Date(),
		content    : 'safansofisanonsaksaon',
		operations : []
	}
];

// This users constants is going to content all the users
// connected to a document
const users = [];

/**
 * This function adds a user to a document
 * @param {*} docId The id of the document to edit
 * @param {*} newUser The user who is going to join
 */
const addUserToDoc = (newUser) => {
	const user = users.find((user) => user.socketId === newUser.socket_id && user.docId === newUser.docId);
	if (user) {
		return {
			error : 'The user is already in'
		};
	}

	users.push(newUser);
	return {
		user : newUser
	};
};

/**
 * This function remove a user from a document
 * @param {*} userId 
 */
const removeUserOfDoc = (userId) => {
	const index = users.findIndex((user) => user.socketId === userId);
	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};

/**
 * This function get a user given an socket id
 * @param {*} userId The id of the user to obtain
 */
const getUser = (userId) => {
	return users.find((user) => user.socket_id === userId);
};

/**
 * This method set the new position of user's cursor
 * @param {*} userId The id of the user
 * @param {*} coords the new coords to set
 */
const getUserAndSaveCoords = (userId, docId, coords) => {
	const index = users.findIndex((user) => user.socketId === userId && user.docId === docId);
	if (index !== -1) {
		users[index].cursorPos = coords;
		return users[index];
	}
};

/**
 * This method gets all the user in a given doc
 * @param {*} docId The id of the doc
 */
const getUsersOfDoc = (userId = null, docId) => {
	if (userId === null) return users.filter((user) => user.docId === docId);
	return users.filter((user) => user.docId === docId && user.socketId !== userId);
};

const getDoc = (docId) => {
	return docs.find((doc) => doc._id === docId);
};

const transformOperation = ({ operation, meta }, doc) => {
	const opVersion = meta.version;
	console.log(
		operation,
		meta,
		doc.operations.map(
			(op) =>
				`${op.operation} baseLength: ${op.operation.baseLength} targetLength: ${op.operation
					.targetLength} version: ${op.meta.version}`
		)
	);

	const operations = doc.operations
		.filter(
			(op) => op.meta.version === opVersion && operation.baseLength === op.operation.baseLength
			// meta.socketId !== op.meta.socketId
		)
		.map((op) => op.operation);
	for (let i = 0; i < operations.length; i++) {
		operation = ot.TextOperation.transform(operation, operations[i])[0];
	}
	console.log(operation);

	return operation;
};

module.exports = {
	docs,
	addUserToDoc,
	removeUserOfDoc,
	getUser,
	getUserAndSaveCoords,
	getUsersOfDoc,
	getDoc,
	transformOperation
};
