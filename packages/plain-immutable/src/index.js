
import makeArrayImmutable from './array';
import makeObjectImmutable from './object';
import { isPlainObject } from './util';
import { isImmutable } from './tag';

export default function immutable(value) {
  if (Array.isArray(value)) return makeArrayImmutable(value);
  if (!value || typeof value !== 'object') return value;
  if (isPlainObject(value)) return makeObjectImmutable(value);
  return value;
}

// export static methods to default export
immutable.fromJS = immutable.fromJSON = immutable;
immutable.isImmutable = isImmutable;

// export static methods to named export
export {
  immutable as fromJS, immutable as fromJSON,
  isImmutable,
};
