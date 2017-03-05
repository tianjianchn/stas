
const BasicStore = require('stas-core');
const ImmStore = require('immutable-state');

class StasImmutableStore extends BasicStore {
  constructor(initialState, { models = [] } = {}) {
    super(initialState);
    this._storage = new ImmStore(initialState, { models });
    this._state = this._storage.getState();

    if (models) {
      models.forEach((model) => {
        this[model.name] = model;
      });
    }
  }

  mutate(callback) {
    this._storage.mutate(callback);
    const newState = this._storage.getState();
    if (newState !== this._state) super.setState(newState);
  }

  setState(newState) { // eslint-disable-line class-methods-use-this
    throw new Error('Cannot call store.setState() directly, use store.mutate() instead');
  }
}

module.exports = StasImmutableStore;
