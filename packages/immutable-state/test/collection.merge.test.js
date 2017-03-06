
const assert = require('assert');
const Store = require('..');// eslint-disable-line no-shadow

describe('immutable-state: collection.merge()', function () {
  describe('normal strategy', function () {
    it('should overwrite literal values in map', function () {
      const store = new Store({ str: 'hello', num: 1, bool: true });
      store.mutate((newState) => {
        newState.merge({ str: 'world' });
        assert.deepStrictEqual(newState.get('str'), 'world');
        newState.merge({ num: 0 });
        assert.deepStrictEqual(newState.get('num'), 0);
        newState.merge({ bool: false, newkey: -1 });
        assert.deepStrictEqual(newState.get('bool'), false);
        assert.deepStrictEqual(newState.get('newkey'), -1);
      });
    });
    it('should overwrite literal values in list', function () {
      const store = new Store(['hello', 1, true]);
      store.mutate((newState) => {
        newState.merge(['world']);
        assert.deepStrictEqual(newState.get(0), 'world');
        newState.merge(['world', 0]);
        assert.deepStrictEqual(newState.get(0), 'world');
        assert.deepStrictEqual(newState.get(1), 0);
        newState.merge(['world', 0, false, -1]);
        assert.deepStrictEqual(newState.get(0), 'world');
        assert.deepStrictEqual(newState.get(1), 0);
        assert.deepStrictEqual(newState.get(2), false);
        assert.deepStrictEqual(newState.get(3), -1);
      });
    });
    it('should overwrite collection values', function () {
      const store = new Store({ strs: ['hello', 'world'] });
      store.mutate((newState) => {
        newState.merge({ strs: ['world'] });
        assert.deepStrictEqual(newState.get('strs').toJSON(), ['world']);
      });
      const store1 = new Store([{ str: 'hello', num: 1 }]);
      store1.mutate((newState) => {
        newState.merge([{ str: 'world' }]);
        assert.deepStrictEqual(newState.get(0).toJSON(), { str: 'world' });
      });
    });
  });

  describe('deep strategy', function () {
    it('should deeply overwrite the values with same collection type', function () {
      const store = new Store({ strs: ['hello', 'world'] });
      store.mutate((newState) => {
        newState.merge(true, { strs: ['world'] });
        assert.deepStrictEqual(newState.get('strs').toJSON(), ['world', 'world']);
      });
      const store1 = new Store([{ str: 'hello', num: 1 }]);
      store1.mutate((newState) => {
        newState.merge(true, [{ str: 'world' }]);
        assert.deepStrictEqual(newState.get(0).toJSON(), { str: 'world', num: 1 });
      });
      const store2 = new Store({ map1: { map2: { str: 'hello', num: 1 } } });
      store2.mutate((newState) => {
        newState.merge(true, { map1: { map2: { str: 'world' } } });
        assert.deepStrictEqual(newState.get('map1').toJSON(), { map2: { str: 'world', num: 1 } });
      });
    });
    it('should not deeply overwrite the values without same collection type', function () {
      const store = new Store({ strs: ['hello', 'world'] });
      store.mutate((newState) => {
        newState.merge(true, { strs: {} });
        assert.deepStrictEqual(newState.get('strs').toJSON(), {});
      });
    });
  });

  describe('function strategy', function () {
    it('should overwrite using the function', function () {
      const store = new Store({ num: 1 });
      store.mutate((newState) => {
        newState.merge((prev, next, key) => prev + next, { num: 2 });
        assert.deepStrictEqual(newState.get('num'), 3);
      });
    });
  });
});

