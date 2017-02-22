
const Store = require('./store');
const List = require('./list');
const Map2 = require('./map');

function createStore(...args) {
  return new Store(...args);
}

function createList(...args) {
  return new List(...args);
}

function createMap(...args) {
  return new Map2(...args);
}

module.exports = {
  Store, createStore,
  List: createList, Map: createMap,
};
