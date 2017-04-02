
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

