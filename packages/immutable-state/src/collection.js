
const isPlainObject = require('lodash.isplainobject');

const operation = global._IMS_MUTATE_OPERATION_;

function Collection(initialData) {
  if (this._type === 'list') {
    this._data = [];
  } else {
    this._data = {};
  }
}

Collection.prototype._type = ''; // list or map

Collection.prototype._data = null; // the keys' value
Collection.prototype._json = null; // the last exported plain json data

// under which mutation operation(store.mutate()).
// if this value equals to global mutation id, that means instance is cloned
// and ready for changed.
Collection.prototype._mutationId = null;

// whether current data is marked changed.
// if instance is cloned and this value is true, that means instance is changed.
Collection.prototype._changed = false;

Collection.prototype._clone = function _clone() {
  const { store, id } = operation;
  if (!store) {
    throw new Error('Cannot mutate the state outside store.mutate()');
  }

  // already cloned
  if (this._mutationId === id) return this;

  // now, we will clone a new collection with the mutation operation id

  // no need to call constructor, since we will assign properties manually
  const cloned = Object.create(this.constructor.prototype);
  cloned._type = this._type;
  cloned._data = this._data;
  cloned._json = this._json;
  cloned._mutationId = id;
  cloned._changed = false;// reset since change always after clone

  return cloned;
};

// if and only if collection is cloned first and _changed is marked true,
// we say it is changed
Collection.prototype._isChanged = function _isChanged() {
  const { id, store } = operation;
  if (store && this._mutationId === id && this._changed) {
    return true;
  }
  return false;
};

Collection.prototype.keys = function keys() {
  return Object.keys(this._data);
};

function getSize() {
  if (this._type === 'list') return this._data.length;
  return Object.keys(this._data).length;
}

Object.defineProperties(Collection.prototype, {
  size: {
    get: getSize,
    enumerable: true,
  },
  length: {
    get: getSize,
    enumerable: true,
  },
});

Collection.prototype.filter = function filter(callback) {
  if (this._type === 'list') return this._fromJSON(this._data.filter(callback));
  else {
    const result = {};
    Object.keys(this._data).forEach((key) => {
      const value = this._data[key];
      if (callback(value, key, this)) {
        result[key] = value;
      }
    });
    return this._fromJSON(result);
  }
};

// returns the first value for which the callback returns true.
Collection.prototype.find = function find(callback) {
  if (this._type === 'list') return this._fromJSON(this._data.find(callback));
  else {
    const key = Object.keys(this._data).find(k => callback(this._data[k], k, this));
    if (key === undefined) return undefined;
    return this._fromJSON(this._data[key]);
  }
};

// returns the key for which the callback returns true.
// returns undefined other than -1 if none match
Collection.prototype.findKey = function findIndex(callback) {
  if (this._type === 'list') {
    const index = this._data.findIndex(callback);
    if (index < 0) return undefined;
    return index;
  } else {
    const keys = Object.keys(this._data);
    const index = keys.findIndex(key => callback(this._data[key], key, this));
    return keys[index];
  }
};

// invoke callback once per each key/value pair
Collection.prototype.forEach = function forEach(callback) {
  if (this._type === 'list') return this._data.forEach(callback);
  else {
    return Object.keys(this._data).forEach(key => callback(this._data[key], key, this));
  }
};

Collection.prototype.map = function map(callback) {
  if (this._type === 'list') return this._fromJSON(this._data.map(callback));
  else {
    const result = {};
    Object.keys(this._data).forEach((key) => {
      result[key] = callback(this._data[key], key, this);
    });
    return this._fromJSON(result);
  }
};

Collection.prototype.reduce = function reduce(callback, initialValue) {
  if (this._type === 'list') return this._fromJSON(this._data.reduce(callback, initialValue));
  else {
    const result = Object.keys(this._data)
      .reduce((prev, key) => callback(prev, this._data[key], key, this), initialValue);
    return this._fromJSON(result);
  }
};

Collection.prototype.get = function get(keysPath) {
  if (!keysPath && keysPath !== 0) throw new Error('Need keys path in get()');
  if (!Array.isArray(keysPath)) keysPath = [keysPath];

  let key = keysPath[0];
  const type = typeof key;
  if (type !== 'string' && type !== 'number') throw new Error('Only support number or string key in get()');

  if (this._type === 'list') {
    key = parseListKey(this, key);
    if (key === undefined) return undefined;
  }
  if (!this._data.hasOwnProperty(key)) return undefined;

  const value = this._data[key];

  if (keysPath.length <= 1) return value;

  if (!(value instanceof Collection)) {
    throw new Error(`Cannot call get() on non-collection value of key ${key}`);
  }
  return value.get(keysPath.slice(1));
};

// Set the value on any level keys' path
// like: set('name', 'tj'), set('name', (value)=>value+1), set(['user', 'name'], 'tj')
Collection.prototype.set = function set(keysPath, value) {
  if (!keysPath && keysPath !== 0) throw new Error('Need keys path in set()');
  if (!Array.isArray(keysPath)) keysPath = [keysPath];

  let key = keysPath[0];
  const type = typeof key;
  if (type !== 'string' && type !== 'number') throw new Error('Only support number or string key in set()');

  if (this._type === 'list') {
    key = parseListKey(this, key, true);
    if (key === undefined) throw new Error('Invalid key in set() on list, should be number or number string');
  }

  const oldValue = this._data[key];

  if (keysPath.length > 1) { // try to call set recursively
    if (!(oldValue instanceof Collection)) {
      throw new Error(`Cannot call set method on non-collection value of key ${key}`);
    }
    value = oldValue.set(keysPath.slice(1), value);
  } else if (typeof value === 'function') { // update key value in callback
    const callback = value;
    value = this._fromJSON(callback(oldValue));
  } else {
    value = this._fromJSON(value);
  }

  if (value === oldValue) return this;

  const cloned = this._clone();
  const data = cloned._data;
  if (!cloned._changed) {
    cloned._changed = true;
    if (cloned._type === 'list') cloned._data = [...data.slice(0, key), value, ...data.slice(key + 1)];
    else cloned._data = { ...data, [key]: value };
  } else {
    cloned._data[key] = value;
  }
  cloned._json = null;

  return cloned;
};

Collection.prototype._fromJSON = function _fromJSON(value) {
  if (!value) return value;

  const Map2 = require('./map');
  const List = require('./list');
  if (value instanceof Collection) {
    return value;
  } else if (Array.isArray(value)) {
    return new List(value);
  } else if (isPlainObject(value)) {
    return new Map2(value);
  }
  return value;
};

// in list it looks like .splice(index, 1)
Collection.prototype.delete = Collection.prototype.remove = function remove(key) {
  if (Array.isArray(key)) {
    return this.set(key.slice(0, -1), value => value.remove(key[key.length - 1]));
  }

  if (this._type === 'list') {
    key = parseListKey(this, key, true);
    if (key === undefined) throw new Error('Invalid key in remove() on list, should be number or number string');
  }
  if (!this._data.hasOwnProperty(key)) return this;

  const cloned = this._clone();
  const data = cloned._data;
  if (!cloned._changed) {
    cloned._changed = true;
    if (cloned._type === 'list') {
      cloned._data = [...data.slice(0, key), ...data.slice(key + 1)];
    } else {
      cloned._data = { ...data };
      delete cloned._data[key];
    }
  } else if (cloned._type === 'list') {
    cloned._data.splice(key, 1);
  } else {
    delete cloned._data[key];
  }

  cloned._json = null;

  return cloned;
};

// merge the value using specific strategy.
// strategy: false for normal, true for deep merge, or function for custom merge
Collection.prototype.merge = function merge(...args) {
  let strategy = false,
    value = null;
  if (args.length < 2) value = args[0];
  else {
    strategy = args[0];
    value = args[1];
  }

  // check strategy
  const type = typeof strategy;
  if (type !== 'boolean' && type !== 'function') {
    throw new Error('Strategy passed to merge() should be boolean or function');
  }

  value = this._fromJSON(value);
  if (!(value instanceof Collection)) {
    throw new Error('Value passed to merge() cannot be converted to collection');
  }

  const cloned = this._clone();
  if (!cloned._changed) {
    cloned._changed = true;
    if (cloned._type === 'list') cloned._data = [...cloned._data];
    else cloned._data = { ...cloned._data };
  }

  if (strategy === false) {
    for (const kk in value._data) {
      cloned._data[kk] = value._data[kk];
    }
  } else if (strategy === true) {
    for (const kk in value._data) {
      const next = value._data[kk],
        prev = cloned._data[kk];
      if (next instanceof Collection && prev instanceof Collection && next._type === prev._type) {
        cloned._data[kk] = prev.merge(true, next);
      } else {
        cloned._data[kk] = next;
      }
    }
  } else { // function
    for (const kk in value._data) {
      const next = value._data[kk],
        prev = cloned._data[kk];
      cloned._data[kk] = strategy(prev, next, kk);
    }
  }

  cloned._json = null;

  return cloned;
};

Collection.prototype.toJS = Collection.prototype.toJSON = function toJSON() {
  if (this._json) return this._json;

  // assign this._json first to avoid infinite loop on circular invoke
  const json = this._json = this._type === 'list' ? [] : {};

  Object.keys(this._data).forEach((key) => {
    const value = this._data[key];
    if (!value) {
      json[key] = value;
      return;
    }

    if (value instanceof Collection) {
      json[key] = value.toJSON();
    } else {
      json[key] = value;
    }
  });

  return json;
};

function parseListKey(coll, key, allowOOB) {
  key = parseInt(key, 10);
  if (isNaN(key)) return undefined;

  const data = coll._data;
  if (key < 0) {
    key += data.length;
  }
  if (!allowOOB && (key < 0 || key >= data.length)) return undefined;
  return key;
}

module.exports = Collection;
