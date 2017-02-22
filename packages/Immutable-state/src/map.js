
const isPlainObject = require('lodash.isplainobject');
const { inherits } = require('./util');
const Collection = require('./collection');

function Map2(initialData) {
  Collection.call(this, initialData);

  if (initialData) {
    if (isPlainObject(initialData)) {
      const List = require('./list');

      Object.keys(initialData).forEach((key) => {
        const value = initialData[key];
        if (Array.isArray(value)) {
          this._data[key] = new List(value);
        } else if (isPlainObject(value)) {
          this._data[key] = new Map2(value);
        } else this._data[key] = value;
      });
      this._json = initialData;
    } else {
      throw new Error('Invalid initial data when creating map');
    }
  }
}
inherits(Map2, Collection);
Map2.prototype._type = 'map';

module.exports = Map2;
