
const Store = require('./store');
const { List, Map, Model } = require('immutable-state');// eslint-disable-line no-shadow

Store.Store = Store;
Store.List = List;
Store.Map = Map;
Store.Model = Model;
module.exports = Store;
