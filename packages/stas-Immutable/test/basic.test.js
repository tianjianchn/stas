
const assert = require('assert');
const { createStore } = require('..');

describe('stas-immutable: basic', function () {
  it('should work with initial state', function () {
    const store = createStore({ str: 'hello' });
    assert.deepStrictEqual(store.state.get('str'), 'hello');
    assert.deepStrictEqual(store.state.toJSON(), { str: 'hello' });
  });
  it('should throw when call .setState()', function () {
    const store = createStore();
    assert.throws(() => store.setState(), /Cannot call store.setState\(\) directly, use store.mutate\(\) instead/);
  });
  it('should not change old state', function () {
    const store = createStore();
    const oldState = store.state;
    store.mutate(newState => newState.set('str', 'hello'));
    assert.notEqual(store.state, oldState);

    store.mutate(newState => newState.set('str', 'world'));
    assert.deepStrictEqual(store.state.toJSON(), { str: 'world' });
    assert.notEqual(store.state, oldState);
  });
  it('should trigger subscribers after state changed', function (done) {
    const store = createStore({ str: 'hello' });
    store.subscribe((newState, oldState) => {
      assert.deepStrictEqual(oldState.toJSON(), { str: 'hello' });
      assert.deepStrictEqual(newState.toJSON(), { str: 'world' });
      done();
    });
    store.mutate(newState => newState.set('str', 'world'));
  });
  it('should work with middleware', function (done) {
    const store = createStore({ str: 'hello' });
    store.subscribe((newState, oldState) => {
      assert.deepStrictEqual(oldState.toJSON(), { str: 'hello' });
      assert.deepStrictEqual(newState.toJSON(), { str: 'world' });
      done();
    });
    store.use((req, resp, next) => {
      if (req.url === '/a') {
        setTimeout(() => {
          store.mutate((newState) => {
            newState.set('str', 'world');
          });
        }, 10);
      }
    });
    store.dispatch('/a');
  });
});
