
const assert = require('assert');
const { List, Map, createStore } = require('..');// eslint-disable-line no-shadow

describe('immutable-state: collection other methods', function () {
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

