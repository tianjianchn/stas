
/* eslint-disable no-unused-vars, strict */

'use strict';

const select = require('../dist/select').default;

const times = 10000;

const obj1 = { a: { b: { c: { d: { e: 1 } } } } };
const obj2 = Object.assign({}, obj1);

console.time('Javscript object property access(obj.key)');
for (let ii = 0; ii < times; ++ii) {
  const v = obj1.a.b.c.d;
}
console.timeEnd('Javscript object property access(obj.key)');


const path1 = 'a.b.c.d';
const path2 = path1.split('.');
console.time('select');
for (let ii = 0; ii < times; ++ii) {
  const v = select.call(obj2, path2);
}
console.timeEnd('select');
