const ot = require('ot');

let document = 'iao';
console.log(document);
const operation = new ot.TextOperation().retain(1).insert('a').retain(document.length - 1);

document = operation.apply(document);

console.log(document);
