
import immutable from '.';
import { isImmutable, setImmutableTag } from './tag';
import { set, setIn } from './set';
import { remove, removeIn } from './remove';
import merge from './merge';

export default function makeObjectImmutable(obj) {
  if (isImmutable(obj)) return obj;

  setImmutableTag.call(obj);

  // deeply make value immutable
  Object.keys(obj).forEach((key) => {
    immutable(obj[key]);
  });

  addNewMethods.call(obj);

  return Object.freeze(obj);
}

function mutable() {
  if (!isImmutable(this)) return this;

  const result = {};
  Object.keys(this).forEach((key) => {
    result[key] = this[key];
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
