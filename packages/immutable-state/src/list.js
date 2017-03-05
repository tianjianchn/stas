
const isPlainObject = require('lodash.isplainobject');
const { inherits } = require('./util');
const Collection = require('./collection');

function List(...args) {
  if (!(this instanceof List)) {
    throw new Error('Cannot call List() without new');
  }
  Collection.apply(this, args);

  const [initialData] = args;
  if (initialData) {
    if (Array.isArray(initialData)) {
      const Map = require('./map');// eslint-disable-line no-shadow

      Object.keys(initialData).forEach((key) => {
        const value = initialData[key];
        if (Array.isArray(value)) {
          this._data[key] = new List(value);
        } else if (isPlainObject(value)) {
          this._data[key] = new Map(value);
        } else this._data[key] = value;
      });
      this._json = initialData;
    } else {
      throw new Error('Invalid initial data when creating list');
    }
  }
}
inherits(List, Collection);
List.prototype._type = 'list';

List.prototype.slice = function slice(start, end) {
  return this._fromJSON(this._data.slice(start, end));
};

// returns the index for which the callback returns true.
// returns -1 other than undefined if none match
List.prototype.findIndex = function findIndex(callback) {
  return this._data.findIndex(callback);
};

// return new list other than length like array.push()
List.prototype.push = function push(...args) {
  if (args.length <= 0) return this;

  const cloned = this._clone();
  cloned._changed = true;
  cloned._json = null;

  args = args.map(arg => this._fromJSON(arg));
  cloned._data = [...cloned._data, ...args];

  return cloned;
};

// return new list other than removed value like array.pop()
List.prototype.pop = function pop() {
  return this.remove(-1);
};

// return new list other than length like array.unshift()
List.prototype.unshift = function unshift(...args) {
  if (args.length <= 0) return this;

  const cloned = this._clone();
  cloned._changed = true;
  cloned._json = null;

  args = args.map(arg => this._fromJSON(arg));
  cloned._data = [...args, ...cloned._data];

  return cloned;
};

// return new list other than removed value like array.shift()
List.prototype.shift = function shift() {
  return this.remove(0);
};

module.exports = List;
