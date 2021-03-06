
import { isPlainObject, clone, shallowCompare, stringify } from './util';
import makeReadOnly from './readonly';
import select, { checkOverSelect } from './select';
import config from './config';

export default function updatex(value, updater, { multiArgs = [] } = {}) {
  if (Array.isArray(value) || isPlainObject(value)) {
    if (typeof updater !== 'function') {
      throw new TypeError(`Invalid updater: ${stringify(updater)}, expect function`);
    }

    // Make the input value readonly to prevent accidental changes on it
    makeReadOnly(value);

    // Clone first to avoid annoying reassignment, like `state = state.xxx()`.
    const cloned = clone(value);

    // Add extra properties
    Object.defineProperties(cloned, {
      select: {
        value: select,
        writable: true,
      },
      $updatex: { // intermediate stage
        value: { selectedPaths: {} },
        writable: true,
      },
    });

    // Call the updater. All your updates should be in it
    updater(cloned, ...multiArgs);

    // If the leaf nodes not changed, warning will be shown
    // as you over select path, then try narrow your path.
    checkOverSelect(cloned, value);

    // Clear extra properties
    cloned.select = undefined;
    cloned.$updatex = undefined;

    // Only compare top nodes for performance consideration,
    // since we will give a warning if no actual changes occur
    // on sub nodes. See checkOverSelect().
    if (shallowCompare(cloned, value)) return value;

    // Make new value readonly too, so no mutation will be outside!
    makeReadOnly(cloned);

    return cloned;
  }
  return value;
}

const { set: setConfig } = config;

export {
  setConfig as config,
  makeReadOnly as readonly,
};
updatex.config = setConfig;
