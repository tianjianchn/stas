
const Store = require('./store');
const immutableState = require('immutable-state');// eslint-disable-line no-shadow

function createStore(...args) {
  return new Store(...args);
}

module.exports = {
  ...immutableState,
  Store, createStore,
};
