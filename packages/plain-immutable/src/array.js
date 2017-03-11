/* eslint prefer-rest-params: off */

import immutable from '.';
import { isImmutable, setImmutableTag } from './tag';
import { set, setIn } from './set';
import { remove, removeIn } from './remove';
import merge from './merge';

export default function makeArrayImmutable(arr) {
  if (isImmutable(arr)) return arr;

  setImmutableTag.call(arr);

  // deeply make value immutable
  arr.forEach((item, index) => {
    immutable(item);
  });

  makeMethodsImmutable.call(arr);

  addNewMethods.call(arr);

  return Object.freeze(arr);
}

function mutable() {
  if (!isImmutable(this)) return this;

  const result = [];
  this.forEach((item, index) => {
    result[index] = this[index];
  });

  // addNewMethods.call(result);

  return result;
}

function addNewMethods() {
  Object.defineProperties(this, {
    mutable: { value: mutable },
    asMutable: { value: mutable },
    set: { value: set },
    setIn: { value: setIn },
    remove: { value: remove },
    delete: { value: remove },
    removeIn: { value: removeIn },
    deleteIn: { value: removeIn },
    merge: { value: merge },
  });
}

const {
  map: _map, filter: _filter, slice: _slice, concat: _concat,
  reduce: _reduce, reduceRight: _reduceRight,
  push: _push, pop: _pop, shift: _shift, unshift: _unshift,
  sort: _sort, reverse: _reverse, splice: _splice,
  copyWithin: _copyWithin, fill: _fill,
} = Array.prototype;

// The replacement methods for array. Use named function to
// keep right function name in the error stack
const REPLACEMENTS = {};

// Make non-mutation methods that does not surely return literal value
// to return immutable value, like slice()
// =================== start: non-mutation methods =================
_slice && (REPLACEMENTS.slice = function slice() {
  return makeArrayImmutable(_slice.apply(this, arguments));
});

_map && (REPLACEMENTS.map = function map() {
  return makeArrayImmutable(_map.apply(this, arguments));
});

_filter && (REPLACEMENTS.filter = function filter() {
  return makeArrayImmutable(_filter.apply(this, arguments));
});

_concat && (REPLACEMENTS.concat = function concat() {
  return makeArrayImmutable(_concat.apply(this, arguments));
});

_reduce && (REPLACEMENTS.reduce = function reduce() {
  return immutable(_reduce.apply(this, arguments));
});

_reduceRight && (REPLACEMENTS.reduceRight = function reduceRight() {
  return immutable(_reduceRight.apply(this, arguments));
});
// =================== end: non-mutation methods =================

// Make mutation methods to return a new immutable copy
// =================== start: mutation methods =================
_push && (REPLACEMENTS.push = function push() {
  const newThis = this.mutable();
  _push.apply(newThis, arguments);
  return makeArrayImmutable(newThis);
});

_pop && (REPLACEMENTS.pop = function pop() {
  const newThis = this.mutable();
  _pop.apply(newThis, arguments);
  return makeArrayImmutable(newThis);
});

_shift && (REPLACEMENTS.shift = function shift() {
  const newThis = this.mutable();
  _shift.apply(newThis, arguments);
  return makeArrayImmutable(newThis);
});

_unshift && (REPLACEMENTS.unshift = function unshift() {
  const newThis = this.mutable();
  _unshift.apply(newThis, arguments);
  return makeArrayImmutable(newThis);
});

_sort && (REPLACEMENTS.sort = function sort() {
  const newThis = this.mutable();
  _sort.apply(newThis, arguments);
  return makeArrayImmutable(newThis);
});

_fill && (REPLACEMENTS.fill = function fill() {
  const newThis = this.mutable();
  _fill.apply(newThis, arguments);
  return makeArrayImmutable(newThis);
});

_splice && (REPLACEMENTS.splice = function splice() {
  const newThis = this.mutable();
  _splice.apply(newThis, arguments);
  return makeArrayImmutable(newThis);
});

_reverse && (REPLACEMENTS.reverse = function reverse() {
  const newThis = this.mutable();
  _reverse.apply(newThis, arguments);
  return makeArrayImmutable(newThis);
});

_copyWithin && (REPLACEMENTS.copyWithin = function copyWithin() {
  const newThis = this.mutable();
  _copyWithin.apply(newThis, arguments);
  return makeArrayImmutable(newThis);
});
// =================== end: mutation methods =================

const PROPERTIES = Object.keys(REPLACEMENTS).reduce((result, method) => {
  result[method] = { value: REPLACEMENTS[method] };
  return result;
}, {});


function makeMethodsImmutable() {
  Object.defineProperties(this, PROPERTIES);
}
