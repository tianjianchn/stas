
const isPlainObject = require('lodash.isplainobject');
const { inherits } = require('./util');
const Collection = require('./collection');

function Map(...args) { // eslint-disable-line no-shadow
  if (!(this instanceof Map)) {
    throw new Error('Cannot call Map() without new');
  }
  Collection.apply(this, args);

  const [initialData] = args;
  if (initialData) {
    if (isPlainObject(initialData)) {
      const List = require('./list');

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
      throw new Error('Invalid initial data when creating map');
    }
  }
}
inherits(Map, Collection);
Map.prototype._type = 'map';// eslint-disable-line no-extend-native

module.exports = Map;
