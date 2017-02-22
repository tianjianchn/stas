
const assert = require('assert');
const { List, createStore } = require('..');

describe('immutable-state: list', function () {
  describe('constructor', function () {
    it('should work with empty initial data', function () {
      assert.deepStrictEqual(List().toJSON(), []);
      assert.deepStrictEqual(List(null).toJSON(), []);
      assert.deepStrictEqual(List(undefined).toJSON(), []);
      assert.deepStrictEqual(List(false).toJSON(), []);
      assert.deepStrictEqual(List(0).toJSON(), []);
      assert.deepStrictEqual(List('').toJSON(), []);
    });
    it('should work with initial array', function () {
      assert.deepStrictEqual(List([]).toJSON(), []);
      assert.deepStrictEqual(List([1, 2]).toJSON(), [1, 2]);
      assert.deepStrictEqual(List(['h', 'e', 'l']).toJSON(), ['h', 'e', 'l']);
      assert.deepStrictEqual(List([true, [1, 2], 'hello', { name: 'Jack' }]).toJSON(), [true, [1, 2], 'hello', { name: 'Jack' }]);
    });
    it('should throw with invalid initial data', function () {
      assert.throws(() => List({}), /Invalid initial data when creating list/);
      assert.throws(() => List(new Date()), /Invalid initial data when creating list/);
      assert.throws(() => List(1), /Invalid initial data when creating list/);
      assert.throws(() => List('h'), /Invalid initial data when creating list/);
      assert.throws(() => List(true), /Invalid initial data when creating list/);
    });
  });
  describe('methods', function () {
    it('.findIndex()', function () {
      const result = [];
      result.push(List().findIndex((value, key) => value === 2));
      result.push(List([1, 2]).findIndex((value, key) => value === 2));
      assert.deepStrictEqual(result, [-1, 1]);
    });
    it('.push()', function () {
      const store = createStore([]);
      store.mutate((newState) => {
        assert.deepStrictEqual(newState.push(1).toJSON(), [1]);
        assert.deepStrictEqual(newState.push(2, 'a', { str: 'hello' }).toJSON(), [1, 2, 'a', { str: 'hello' }]);
      });
    });
    it('.pop()', function () {
      const store = createStore([]);
      store.mutate((newState) => {
        assert.deepStrictEqual(newState.pop().toJSON(), []);
        newState.push(1).push(2);
        assert.deepStrictEqual(newState.toJSON(), [1, 2]);
        assert.deepStrictEqual(newState.pop().toJSON(), [1]);
        assert.deepStrictEqual(newState.pop().toJSON(), []);
      });
    });
    it('.unshift()', function () {
      const store = createStore([]);
      store.mutate((newState) => {
        assert.deepStrictEqual(newState.unshift(1).toJSON(), [1]);
        assert.deepStrictEqual(newState.unshift(2, 'a', { str: 'hello' }).toJSON(), [2, 'a', { str: 'hello' }, 1]);
      });
    });
    it('.shift()', function () {
      const store = createStore([]);
      store.mutate((newState) => {
        assert.deepStrictEqual(newState.shift().toJSON(), []);
        newState.push(1, 2);
        assert.deepStrictEqual(newState.toJSON(), [1, 2]);
        assert.deepStrictEqual(newState.shift().toJSON(), [2]);
        assert.deepStrictEqual(newState.shift().toJSON(), []);
      });
    });
  });
});

