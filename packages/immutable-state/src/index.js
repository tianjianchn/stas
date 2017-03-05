
const Store = require('./store');
const List = require('./list');
const Map = require('./map');// eslint-disable-line no-shadow
const Model = require('./model');

Store.Store = Store;
Store.List = List;
Store.Map = Map;
Store.Model = Model;
module.exports = Store;
