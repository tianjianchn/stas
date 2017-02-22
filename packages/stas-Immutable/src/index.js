
const Store = require('./store');
const { List, Map } = require('immutable-state');// eslint-disable-line no-shadow

function createStore(...args) {
  return new Store(...args);
}

module.exports = {
  Store, createStore, List, Map,
};
