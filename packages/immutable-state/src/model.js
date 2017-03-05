
const isPlainObject = require('lodash.isplainobject');

const operation = global._IMS_MUTATE_OPERATION_;

function Model(name, fields) {
  if (!name) {
    throw new Error('Need name to create a model');
  }

  this._name = name;

  this._fields = fields || {};// {<field name>: <model>}
}

Object.defineProperties(Model.prototype, {
  name: {
    get() {
      return this._name;
    },
  },
});

function getModel(key, val) {
  let model = val;
  if (typeof val === 'string') {
    model = this._store._models[val];
  }

  if (!model) {
    throw new Error(`Not found model ${val} for field ${key} of model ${this._name}`);
  } else if (!(model instanceof Model)) {
    throw new Error(`Need model for field ${key} of model ${this._name}`);
  } else {
    return model;
  }
}

function validate() {
  if (!this._fields) return;
  Object.keys(this._fields).forEach((key) => {
    const val = this._fields[key];
    this._fields[key] = getModel.call(this, key, val);
  });
}

Model.prototype.bindStore = function bindStore(store) {
  if (this._store) {
    throw new Error(`Model ${this._name} should be attached to only one store`);
  }
  this._store = store;
  validate.call(this);
};

// merge the plain json data to the model, return id(s)
Model.prototype.merge = function merge(input) {
  if (!input) return input;
  if (Array.isArray(input)) {
    return input.map(value => this.merge(value));
  }
  if (!isPlainObject(input)) return input;

  // object
  Object.keys(input).forEach((key) => {
    const val = input[key],
      model = this._fields[key];
    if (model && val) {
      input[key] = model.merge(val);
    }
  });

  const { store, state } = operation;
  if (!state) {
    throw new Error('Cannot mutate the state outside store.mutate()');
  }
  if (this._store !== store) {
    throw new Error(`The store of model ${this._name} is not in mutation operation`);
  }
  state.set(['__models__', this._name, input.id], value => (value ? value.merge(input) : input));
  return input.id;
};

Model.prototype.get = function get(id) {
  if (!id) return null;

  const { store, state } = operation;
  if (state) { // under mutation
    if (this._store !== store) {
      throw new Error(`The store of model ${this._name} is not in mutation operation`);
    }
    return state.get(['__models__', this._name, id]);
  } else {
    return this._store.state.get(['__models__', this._name, id]);
  }
};

Model.prototype.mget = function mget(...args) {
  const result = [];
  args.forEach((arg) => {
    if (Array.isArray(arg)) {
      arg.forEach((id) => {
        result.push(this.get(id));
      });
    } else {
      result.push(this.get(arg));
    }
  });
  return result;
};

module.exports = Model;
