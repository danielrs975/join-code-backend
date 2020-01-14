const ot = require('ot');

let document = 'iao\n\nHola';
// console.log(document);
// const operation = new ot.TextOperation().retain(1).insert('a').retain(document.length - 1);

// document = operation.apply(document);
// console.log(document);
// const operation_2 = new ot.TextOperation().retain(1).delete('a').retain(document.length - 2);

// document = operation_2.apply(document);

// console.log(document);

const executeOperation = (operation) => {
	const newDocument = operation.apply(document);
	return newDocument;
};

const str = '\n';
const position = 4;
document = executeOperation(new ot.TextOperation().retain(position).insert(str).retain(document.length - position));
console.log("Inserting 'hola': ", document);

document = executeOperation(
	new ot.TextOperation().retain(position).delete(str).retain(document.length - position - str.length)
);
console.log("Deleting 'hola': ", document);
