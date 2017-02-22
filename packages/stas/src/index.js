
const Store = require('./store');

function createStore(...args) {
  return new Store(...args);
}

module.exports = {
  Store, createStore,
};
