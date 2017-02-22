
// when calling store.mutate(), a new mutation operation will be started.
// since mutatation process is always sync, so we use a gobal variable to
// keep the information.
global._IMS_MUTATE_OPERATION_ = {
  // mutation operation id, increased on each operation
  // init with random number to avoid duplicate id on hot reload
  id: parseInt(Math.random() * 1000000000, 10) + 1,

  // current store that is doing mutatation operation
  store: null,
};
const operation = global._IMS_MUTATE_OPERATION_;

const isPlainObject = require('lodash.isplainobject');
const Collection = require('./collection');
const Map2 = require('./map');
const List = require('./list');

function Store(initialData) {
  if (!initialData) this._state = new Map2();
  else if (initialData instanceof Collection) this._state = initialData;
  else if (Array.isArray(initialData)) this._state = new List(initialData);
  else if (isPlainObject(initialData)) this._state = new Map2(initialData);
  else throw new Error('Invalid initial state when creating store');
}

Store.prototype._state = null;// instance of Collection

// start a new mutation operation. `callback` function should only has sync codes
Store.prototype.mutate = function mutate(callback) {
  if (!callback || typeof callback !== 'function') {
    throw new TypeError('Need callback function in store.mutate()');
  }
  if (operation.store) {
    throw new Error('Cannot start another mutation operation');
  }

  try {
    operation.id = operation.id % 2147483647 + 1;// avoid zero(0)
    operation.store = this;

    const newState = this._state._clone();
    callback(newState);

    // newState._deepCheckMutation();
    const isChanged = newState._isChanged();
    if (isChanged) this._state = newState;
  } finally {
    operation.store = null;
  }
};

Store.prototype.getState = function getState() {
  return this._state;
};

module.exports = Store;
