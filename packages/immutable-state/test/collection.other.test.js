
const assert = require('assert');
const { List, Map, createStore } = require('..');// eslint-disable-line no-shadow

describe('immutable-state: collection other methods', function () {
  describe('.toJSON()', function () {
    it('should work with empty initial data', function () {
      assert.deepStrictEqual(Map().toJSON(), {});
      assert.deepStrictEqual(List().toJSON(), []);
    });
    it('should not change initial data', function () {
      const obj = {},
        arr = [];
      assert.strictEqual(Map(obj).toJSON(), obj);
      assert.strictEqual(List(arr).toJSON(), arr);
    });
    it('should not touch json without any change', function () {
      const json = { str: 'hello', list: [1] };
      const store = createStore(json);
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
      const store = createStore(json);
      store.mutate((newState) => {
        newState.set('str', 'world');
      });
      assert.notEqual(store.getState().toJSON(), json);
      assert.deepStrictEqual(store.getState().toJSON(), { str: 'world', list: [1] });
    });
    it('should reset json when changing a list', function () {
      const store = createStore({ list: [] });
      store.mutate((newState) => {
        newState.set('list', value => value.set(0, 1));
        assert.deepStrictEqual(newState.get(['list', 0]), 1);
      });
      assert.deepStrictEqual(store.getState().toJSON(), { list: [1] });
    });
  });
  it('.keys()', function () {
    assert.deepStrictEqual(Map().keys(), []);
    assert.deepStrictEqual(Map({ a: 1, b: 2 }).keys(), ['a', 'b']);
    assert.deepStrictEqual(List().keys(), []);
    assert.deepStrictEqual(List([1, 2]).keys(), ['0', '1']);
  });
  it('.length/.size', function () {
    assert.deepStrictEqual(Map().length, 0);
    assert.deepStrictEqual(Map().size, 0);
    assert.deepStrictEqual(Map({ a: 1, b: 2 }).length, 2);
    assert.deepStrictEqual(Map({ a: 1, b: 2 }).size, 2);
    assert.deepStrictEqual(List().length, 0);
    assert.deepStrictEqual(List().size, 0);
    assert.deepStrictEqual(List([1, 2]).length, 2);
    assert.deepStrictEqual(List([1, 2]).size, 2);
  });
  it('.filter()', function () {
    assert.deepStrictEqual(Map().filter((value, key) => value > 1).toJSON(), {});
    assert.deepStrictEqual(Map({ a: 1, b: 2 }).filter((value, key) => value > 1).toJSON(), { b: 2 });

    assert.deepStrictEqual(List().filter((value, key) => value > 1, []).toJSON(), []);
    assert.deepStrictEqual(List([1, 2]).filter((value, key) => value > 1).toJSON(), [2]);
  });
  it('.find()', function () {
    assert.deepStrictEqual(Map().find((value, key) => value > 1), undefined);
    assert.deepStrictEqual(Map({ a: 1, b: 2 }).find((value, key) => value > 1), 2);
    assert.deepStrictEqual(Map({ a: { val: 1 }, b: { val: 2 } }).find((value, key) => value.get('val') > 1).toJSON(), { val: 2 });

    assert.deepStrictEqual(List().find((value, key) => value > 1, []), undefined);
    assert.deepStrictEqual(List([1, 2]).find((value, key) => value > 1), 2);
    assert.deepStrictEqual(List([[1], [2]]).find((value, key) => value.get(0) > 1).toJSON(), [2]);
  });
  it('.findKey()', function () {
    const result = [];
    result.push(Map().findKey((value, key) => value === 2));
    result.push(Map({ a: 1, b: 2 }).findKey((value, key) => value === 2));
    result.push(List().findKey((value, key) => value === 2));
    result.push(List([1, 2]).findKey((value, key) => value === 2));
    assert.deepStrictEqual(result, [undefined, 'b', undefined, 1]);
  });
  it('.forEach()', function () {
    const result = [];
    Map().forEach((value, key) => result.push(value));
    Map({ a: 1, b: 2 }).forEach((value, key) => result.push(value));
    List().forEach((value, key) => result.push(value));
    List([1, 2]).forEach((value, key) => result.push(value));
    assert.deepStrictEqual(result, [1, 2, 1, 2]);
  });
  it('.map()', function () {
    assert.deepStrictEqual(Map().map((value, key) => 1).toJSON(), {});
    assert.deepStrictEqual(Map({ a: 1, b: 2 }).map((value, key) => value + 1).toJSON(), { a: 2, b: 3 });

    assert.deepStrictEqual(List().map((value, key) => 1, []).toJSON(), []);
    assert.deepStrictEqual(List([1, 2]).map((value, key) => value + 1).toJSON(), [2, 3]);
  });
  it('.reduce()', function () {
    assert.deepStrictEqual(Map().reduce((result, value, key) => null, {}).toJSON(), {});
    assert.deepStrictEqual(Map({ a: 1, b: 2 }).reduce((result, value, key) => {
      result += value;
      return result;
    }, 0), 3);

    assert.deepStrictEqual(List().reduce((result, value, key) => null, []).toJSON(), []);
    assert.deepStrictEqual(List([1, 2]).reduce((result, value, key) => {
      result += value;
      return result;
    }, 0), 3);
  });
  it('.remove()/.delete()', function () {
    const store = createStore({});
    store.mutate((newState) => {
      assert.deepStrictEqual(newState.remove('a').toJSON(), {});
      newState.set('a', 1).set('b', 2);
      assert.deepStrictEqual(newState.toJSON(), { a: 1, b: 2 });
      assert.deepStrictEqual(newState.remove('a').toJSON(), { b: 2 });
    });

    const store1 = createStore([]);
    store1.mutate((newState) => {
      assert.deepStrictEqual(newState.remove(0).toJSON(), []);
      newState.set(0, 1).set(1, 2);
      assert.deepStrictEqual(newState.toJSON(), [1, 2]);
      assert.deepStrictEqual(newState.remove(0).toJSON(), [2]);
      assert.deepStrictEqual(newState.remove(0).toJSON(), []);
    });
  });
});

