
const { Store: StasStore } = require('stas');
const ImmStore = require('immutable-state');

class StasImmutableStore extends StasStore {
  constructor(initialState) {
    super(initialState);
    this._storage = new ImmStore(initialState);
    this._state = this._storage.getState();
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
