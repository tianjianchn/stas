
import immutable from './index';
import { validateKey, validateKeyInKeyPath } from './util';
import { recursivelySet } from './set';

/**
 * Remove the leaf key in key path. If any key is not existent, nothing changed
 * @param keyPath string|array
 */
export function removeIn(keyPath) {
  if (!Array.isArray(keyPath)) keyPath = [keyPath];

  // validate key path first
  const len = keyPath.length;
  validateKeyInKeyPath(keyPath, keyPath[0]);// consider zero length
  for (let ii = 1; ii < len; ++ii) {
    validateKeyInKeyPath(keyPath, keyPath[ii]);
  }

  if (keyPath.length > 1) {  // remove the key on leaf node
    const setter = value => _remove.call(value, keyPath[len - 1]);
    return recursivelySet.call(this, keyPath.slice(0, -1), 0, setter, true);
  } else {
    return _remove.call(this, keyPath[0]);
  }
}

export function remove(key) {
  key = validateKey(key);
  return _remove.call(this, key);
}

function _remove(key) {
  if (!this.hasOwnProperty(key)) return this;

  const newThis = this.mutable();
  if (Array.isArray(newThis)) {
    newThis.splice(key, 1);
  } else {
    delete newThis[key];
  }
  return immutable(newThis);
}
