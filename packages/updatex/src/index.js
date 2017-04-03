
import { isPlainObject, clone, shallowCompare, stringify } from './util';
import makeReadOnly from './readonly';
import select, { checkOverSelect } from './select';
import config from './config';

export default function updatex(value, callback, { multiArgs = [] } = {}) {
  if (Array.isArray(value) || isPlainObject(value)) {
    if (typeof callback !== 'function') {
      throw new TypeError(`Invalid callback: ${stringify(callback)}, expect function`);
    }

    const cloned = clone(value);
    Object.defineProperties(cloned, {
      select: { value: select },
    });

    makeReadOnly(value);
    callback(cloned, ...multiArgs);

    checkOverSelect(cloned, value);

    if (shallowCompare(cloned, value)) return value;

    makeReadOnly(cloned);
    return cloned;
  }
  return value;
}

const { set: setConfig } = config;

export {
  setConfig as config,
};
updatex.config = setConfig;
