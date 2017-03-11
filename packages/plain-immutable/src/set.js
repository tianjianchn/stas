
import immutable from './index';
import { stringify, validateKey, validateKeyInKeyPath } from './util';

/**
 * Set the value at leaf key of key path. if any key is not existent, create an object.
 * @param keyPath string|array.
 * @param value json|immutable|function.
 */
export function setIn(keyPath, value) {
  if (!Array.isArray(keyPath)) keyPath = [keyPath];
  return recursivelySet.call(this, keyPath, 0, value);
}

export function set(key, value) {
  key = validateKey(key);
  return recursivelySet.call(this, [key], 0, value);
}

export function recursivelySet(keyPath, ii, value, breakOnNonExistentKey) {
  const key = validateKeyInKeyPath(keyPath, keyPath[ii]);

  // if key not existent, return immediately, see removeIn()
  const hasKey = this.hasOwnProperty(key);
  if (breakOnNonExistentKey && !hasKey) return this;

  const oldValue = this[key];

  if (keyPath.length - 1 > ii) { // has sub keys, try to call set recursively
    if (hasKey) {
      if (!oldValue || typeof oldValue !== 'object') {
        const position = stringify(keyPath.slice(0, ii + 1));
        throw new TypeError(`Cannot update on non-object value at ${position}: ${stringify(oldValue)}`);
      }

      value = recursivelySet.call(oldValue, keyPath, ii + 1, value, breakOnNonExistentKey);
    } else { // for nonexistent key, create an object first
      value = recursivelySet.call(immutable({}), keyPath, ii + 1, value, breakOnNonExistentKey);
    }
  } else if (typeof value === 'function') { // update key value by function(setter)
    const setter = value;
    value = immutable(setter(oldValue));
  } else {
    value = immutable(value);
  }

  // if key is not existent, value will always be set
  if (!this.hasOwnProperty(key) || value !== oldValue) {
    const newThis = this.mutable();
    newThis[key] = value;
    return immutable(newThis);
  }

  // no change
  return this;
}
