const isPlainObject = require('lodash.isplainobject');

// when calling store.mutate(), a new mutation operation will be started.
// since mutatation process is always sync, so we use a gobal variable to
// keep the information.
global._IMS_MUTATE_OPERATION_ = {
  // mutation operation id, increased on each operation.
  // init with random number to avoid duplicate id on hot reload
  id: parseInt(Math.random() * 1000000000, 10) + 1,

  // current store that is doing mutatation operation
  store: null,

  // new state of store for current mutation operation
  state: null,
};
const operation = global._IMS_MUTATE_OPERATION_;

const Collection = require('./collection');
const Map = require('./map');// eslint-disable-line no-shadow
const List = require('./list');
const Model = require('./model');

function Store(initialData, { models } = {}) {
  if (!(this instanceof Store)) {
    throw new Error('Cannot call Store() without new');
  }

  if (initialData instanceof Collection) initialData = initialData.toJSON();

  if (models && Array.isArray(models) && models.length > 0) {
    if (Array.isArray(initialData)) {
      throw new Error('Cannot use model on a non-map type state');
    }

    this._models = {};
    models.forEach((model) => {
      if (typeof model === 'string') model = [model];
      const [name, fields, options] = model;
      this._models[name] = new Model(name, fields, { ...options, store: this });
    });

    Object.keys(this._models).forEach((name) => {
      this._models[name].ensure();
    });

    initialData = this.ensureModels(initialData || {});
    this._state = new Map(initialData);

    Object.defineProperty(this, 'models', {
      get() {
        return this._models;
      },
    });
  } else if (!initialData) this._state = new Map();
  else if (Array.isArray(initialData)) this._state = new List(initialData);
  else if (isPlainObject(initialData)) this._state = new Map(initialData);
  else throw new Error('Invalid initial state when creating store');
}

Store.prototype._state = null;// instance of Collection

Store.prototype.ensureModels = function ensureModels(data) {
  if (!this._models) return data;
  if (!data) return data;
  if (!isPlainObject(data)) {
    throw new Error('Only allow plain json object data in ensureModels()');
  }

  if (!data.__models__) data.__models__ = {};
  const modelsData = data.__models__;

  const modelNames = Object.keys(this._models);
  modelNames.forEach((name) => {
    if (!modelsData[name]) modelsData[name] = {};
  });
  return data;
};

// start a new mutation operation. `callback` function should only has sync codes
Store.prototype.mutate = function mutate(callback) {
  if (!callback || typeof callback !== 'function') {
    throw new TypeError('Need callback function in store.mutate()');
  }
  if (operation.store) {
    throw new Error('Cannot start another mutation operation');
  }

  try {
    operation.id = operation.id % 2147483647 + 1;// plus 1 to avoid zero(0)
    operation.store = this;

    const newState = this._state._clone();
    operation.state = newState;// attach the new state, which will be used by models

    callback(newState);

    const isChanged = newState._isChanged();
    if (isChanged) this._state = newState;
  } finally {
    operation.store = null;
    operation.state = null;
  }
};

Store.prototype.getState = function getState() {
  return this._state;
};

Object.defineProperty(Store.prototype, 'state', {
  get() {
    return this._state;
  },
});

module.exports = Store;
