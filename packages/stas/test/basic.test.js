
const assert = require('assert');
const { createStore, Store } = require('..');

describe('stas: basic', function () {
  it('should work with empty initial state', function () {
    const store = createStore();
    assert.deepStrictEqual(store.state, undefined);
  });
  it('should work with initial state', function () {
    const initialState = { count: 0 };
    const store = createStore(initialState);
    assert.strictEqual(store.state, initialState);
    assert.deepStrictEqual(store.state, { count: 0 });
  });

  it('should not change old state', function () {
    const store = createStore();
    const oldState = store.state;
    store.setState({});
    assert.deepStrictEqual(store.state, { });
    assert.notEqual(store.state, oldState);

    const newState = { count: 1 };
    store.setState(newState);
    assert.deepStrictEqual(store.state, { count: 1 });
    assert.notEqual(store.state, oldState);
    assert.strictEqual(store.state, newState);
  });
  it('should work with literal value', function () {
    const store = createStore();
    store.setState(null);
    assert.deepStrictEqual(store.state, null);
    store.setState(undefined);
    assert.deepStrictEqual(store.state, undefined);
    store.setState(1);
    assert.deepStrictEqual(store.state, 1);
    store.setState('');
    assert.deepStrictEqual(store.state, '');
  });
  it('should keep silence when change state property', function () {
    const state = { a: 1 };
    const store = createStore(state);
    store.subscribe(() => {
      throw new Error('should not reach here');
    });

    store.setState(state);
    assert.equal(store.state, state);
    assert.deepStrictEqual(store.state, { a: 1 });

    state.a = 2;
    store.setState(state);
    assert.equal(store.state, state);
    assert.deepStrictEqual(store.state, { a: 2 });
  });
  it('should trigger subscribers after state changed', function (done) {
    const store = createStore({ a: '' });
    store.subscribe((newState, oldState) => {
      assert.deepStrictEqual(oldState, { a: '' });
      assert.deepStrictEqual(newState, { a: 1 });
      done();
    });
    store.setState({ a: 1 });
  });
  describe('.dispatch()', function () {
    it('should bound this with store', function () {
      const store = createStore();
      const dispatch = store.dispatch;
      dispatch('/');// shoud not throw
    });
    it('should have override ability by child class', async function () {
      const result = [];
      class SubStore extends Store {
        dispatch(...args) {
          result.push(1);
          super.dispatch(...args);
        }
      }
      const store = new SubStore();
      store.use(() => (result.push(2)));
      await store.dispatch('/');
      assert.deepStrictEqual(result, [1, 2]);
    });
  });
});
