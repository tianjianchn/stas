
const isPlainObject = require('lodash.isplainobject');

const operation = global._IMS_MUTATE_OPERATION_;

function Model(name, fields, { store } = {}) {
  if (!name) {
    throw new Error('Need name to create a model');
  }
  if (!store) {
    throw new Error('Need store to create a model');
  }

  this._name = name;
  this._store = store;
  this._fields = fields || {};// {<field name>: <model>}
}

Object.defineProperty(Model.prototype, 'name', {
  get() {
    return this._name;
  },
});

function getModel(key, val) {
  let model = val;
  if (typeof val === 'string') {
    model = this._store._models[val];
  }

  if (!model) {
    throw new Error(`Not found model ${val} for field ${key} in model ${this._name}`);
  } else if (!(model instanceof Model)) {
    throw new Error(`Need model for field ${key} in model ${this._name}`);
  } else {
    return model;
  }
}

Model.prototype.ensure = function ensure() {
  if (!this._fields) return;
  Object.keys(this._fields).forEach((key) => {
    const val = this._fields[key];
    this._fields[key] = getModel.call(this, key, val);
  });
};

function getState(isMutatation) {
  const { store, state } = operation;

  if (isMutatation) {
    if (!state) {
      throw new Error('Cannot mutate the state outside store.mutate()');
    }
    if (this._store !== store) {
      throw new Error(`The store of model ${this._name} is not in mutation operation`);
    }
    return state;
  } else {
    if (state) { // under mutation
      if (this._store !== store) {
        throw new Error(`The store of model ${this._name} is not in mutation operation`);
      }
      return state;
    }
    return this._store.state;
  }
}

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

  const state = getState.call(this, true);
  state.set(['__models__', this._name, input.id], value => (value ? value.merge(input) : input));
  return input.id;
};

Model.prototype.get = function get(id) {
  if (!id) return null;

  const state = getState.call(this);
  return state.get(['__models__', this._name, id]);
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

Model.prototype.set = function set(id, value) {
  const state = getState.call(this, true);
  state.set(['__models__', this._name, id], value);
};

Model.prototype.remove = function remove(id) {
  const state = getState.call(this, true);
  state.remove(['__models__', this._name, id]);
};


module.exports = Model;
