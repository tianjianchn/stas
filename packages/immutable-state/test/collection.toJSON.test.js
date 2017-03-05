
const assert = require('assert');
const { List, Map, Store } = require('..');// eslint-disable-line no-shadow

describe('immutable-state: collection.toJSON()', function () {
  it('should work with empty initial data', function () {
    assert.deepStrictEqual(new Map().toJSON(), {});
    assert.deepStrictEqual(new List().toJSON(), []);
  });
  it('should not change initial data', function () {
    const obj = {},
      arr = [];
    assert.strictEqual(new Map(obj).toJSON(), obj);
    assert.strictEqual(new List(arr).toJSON(), arr);
  });
  it('should not touch json without any change', function () {
    const json = { str: 'hello', list: [1] };
    const store = new Store(json);
    assert.strictEqual(store.getState().toJSON(), json);
    store.mutate(() => null);
    assert.strictEqual(store.getState().toJSON(), json);
    store.mutate((newState) => {
      newState.set('str', 'hello');
    });
    assert.strictEqual(store.getState().toJSON(), json);
  });
  it('should get new json with mutation', function () {
    const json = { str: 'hello', list: [1] };
    const store = new Store(json);
    store.mutate((newState) => {
      newState.set('str', 'world');
    });
    assert.notEqual(store.getState().toJSON(), json);
    assert.deepStrictEqual(store.getState().toJSON(), { str: 'world', list: [1] });
  });
  it('should reset json when changing a list', function () {
    const store = new Store({ list: [] });
    store.mutate((newState) => {
      newState.set('list', value => value.set(0, 1));
      assert.deepStrictEqual(newState.get(['list', 0]), 1);
    });
    assert.deepStrictEqual(store.getState().toJSON(), { list: [1] });
  });
});

