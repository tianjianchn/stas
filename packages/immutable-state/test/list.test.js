
const assert = require('assert');
const { List, Store } = require('..');

describe('immutable-state: list', function () {
  describe('constructor', function () {
    it('should work with empty initial data', function () {
      assert.deepStrictEqual(new List().toJSON(), []);
      assert.deepStrictEqual(new List(null).toJSON(), []);
      assert.deepStrictEqual(new List(undefined).toJSON(), []);
      assert.deepStrictEqual(new List(false).toJSON(), []);
      assert.deepStrictEqual(new List(0).toJSON(), []);
      assert.deepStrictEqual(new List('').toJSON(), []);
    });
    it('should work with initial array', function () {
      assert.deepStrictEqual(new List([]).toJSON(), []);
      assert.deepStrictEqual(new List([1, 2]).toJSON(), [1, 2]);
      assert.deepStrictEqual(new List(['h', 'e', 'l']).toJSON(), ['h', 'e', 'l']);
      assert.deepStrictEqual(new List([true, [1, 2], 'hello', { name: 'Jack' }]).toJSON(), [true, [1, 2], 'hello', { name: 'Jack' }]);
    });
    it('should throw with invalid initial data', function () {
      assert.throws(() => new List({}), /Invalid initial data when creating list/);
      assert.throws(() => new List(new Date()), /Invalid initial data when creating list/);
      assert.throws(() => new List(1), /Invalid initial data when creating list/);
      assert.throws(() => new List('h'), /Invalid initial data when creating list/);
      assert.throws(() => new List(true), /Invalid initial data when creating list/);
    });
  });
  describe('methods', function () {
    it('.slice()', function () {
      assert.deepStrictEqual(new List().slice(1).toJSON(), []);
      assert.deepStrictEqual(new List([1, 2]).slice().toJSON(), [1, 2]);
      assert.deepStrictEqual(new List([1, 2]).slice(1).toJSON(), [2]);
      assert.deepStrictEqual(new List([1, 2]).slice(-1).toJSON(), [2]);
    });
    it('.findIndex()', function () {
      const result = [];
      result.push(new List().findIndex((value, key) => value === 2));
      result.push(new List([1, 2]).findIndex((value, key) => value === 2));
      assert.deepStrictEqual(result, [-1, 1]);
    });
    it('.push()', function () {
      const store = new Store([]);
      store.mutate((newState) => {
        assert.deepStrictEqual(newState.push(1).toJSON(), [1]);
        assert.deepStrictEqual(newState.push(2, 'a', { str: 'hello' }).toJSON(), [1, 2, 'a', { str: 'hello' }]);
      });
    });
    it('.pop()', function () {
      const store = new Store([]);
      store.mutate((newState) => {
        assert.deepStrictEqual(newState.pop().toJSON(), []);
        newState.push(1).push(2);
        assert.deepStrictEqual(newState.toJSON(), [1, 2]);
        assert.deepStrictEqual(newState.pop().toJSON(), [1]);
        assert.deepStrictEqual(newState.pop().toJSON(), []);
      });
    });
    it('.unshift()', function () {
      const store = new Store([]);
      store.mutate((newState) => {
        assert.deepStrictEqual(newState.unshift(1).toJSON(), [1]);
        assert.deepStrictEqual(newState.unshift(2, 'a', { str: 'hello' }).toJSON(), [2, 'a', { str: 'hello' }, 1]);
      });
    });
    it('.shift()', function () {
      const store = new Store([]);
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

