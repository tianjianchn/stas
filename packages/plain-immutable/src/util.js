
// react element is plain object too, so we need escape it from isPlainObject
// see https://github.com/facebook/react/blob/v15.0.1/src/isomorphic/classic/element/ReactElement.js#L21
const REACT_ELEMENT_TYPE_SYMBOL = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element');
const REACT_ELEMENT_TYPE_NUMBER = 0xeac7;
export function isReactElement(value) {
  return value && (value.$$typeof === REACT_ELEMENT_TYPE_SYMBOL || value.$$typeof === REACT_ELEMENT_TYPE_NUMBER);
}

export function isPlainObject(value) {
  if (!value) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const _toString = Object.prototype.toString;
export function stringify(value) {
  if (Array.isArray(value)) return `[${value}]`;

  const type = typeof value;
  if (type === 'string') return JSON.stringify(value);
  if (value && type === 'object') {
    return _toString.call(value);
  }
  return String(value);
}

export function validateKeyInKeyPath(keyPath, key) {
  const type = typeof key;
  if (type !== 'string' && type !== 'number' || key === '') {
    throw new TypeError(`Invalid key path: ${stringify(keyPath)}, expect number or non-empty string in array`);
  }
  return key;
}

export function validateKey(key) {
  const type = typeof key;
  if (type !== 'string' && type !== 'number' || key === '') {
    throw new Error(`Invalid key: ${stringify(key)}, expect number or non-empty string`);
  }
  return key;
}

