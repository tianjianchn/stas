
const Store = require('./store');
const { List, Map } = require('immutable-state');// eslint-disable-line no-shadow

Store.Store = Store;
Store.List = List;
Store.Map = Map;
module.exports = Store;
