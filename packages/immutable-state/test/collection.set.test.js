
const assert = require('assert');
const { Store, List, Map } = require('..');// eslint-disable-line no-shadow

describe('immutable-state: collection.set()', function () {
  describe('invalid key', function () {
    it('should throw with empty key', function () {
      assert.throws(() => new Map().set(), /Need keys path in set\(\)/);
      assert.throws(() => new Map().set(), /Need keys path in set\(\)/);
      assert.throws(() => new Map().set(null), /Need keys path in set\(\)/);
      assert.throws(() => new Map().set(undefined), /Need keys path in set\(\)/);
      assert.throws(() => new Map().set(false), /Need keys path in set\(\)/);
    });
    it('should throw with invalid key', function () {
      assert.throws(() => new Map().set(true), /Only support number or string key in set\(\)/);
      assert.throws(() => new Map().set(new Date()), /Only support number or string key in set\(\)/);
      assert.throws(() => new Map().set({}), /Only support number or string key in set\(\)/);
      assert.throws(() => new Map().set([]), /Only support number or string key in set\(\)/);
      assert.throws(() => new Map().set([null]), /Only support number or string key in set\(\)/);
      assert.throws(() => new Map().set([undefined]), /Only support number or string key in set\(\)/);
      assert.throws(() => new Map().set([true]), /Only support number or string key in set\(\)/);
      assert.throws(() => new Map().set([false]), /Only support number or string key in set\(\)/);
      assert.throws(() => new Map().set([new Date()]), /Only support number or string key in set\(\)/);
      assert.throws(() => new Map().set([[]]), /Only support number or string key in set\(\)/);
      assert.throws(() => new Map().set([{}]), /Only support number or string key in set\(\)/);
      assert.throws(() => new List().set('a'), /Invalid key in set\(\) on list, should be number or number string/);
      assert.throws(() => new Map().set(['1', '2']), /Cannot call set method on non-collection value of key 1/);
    });
    it('should throw with invalid sub key', function () {
      const store = new Store({ str: {} });
      store.mutate((newState) => {
        assert.throws(() => newState.set(['str', null], 1), /Only support number or string key in set\(\)/);
      });
    });
    it('should throw when set on non-collection value', function () {
      const store = new Store();
      store.mutate((newState) => {
        assert.throws(() => newState.set([1, null], 1), /Cannot call set method on non-collection value of key 1/);
      });
    });
  });

  describe('literal value', function () {
    it('should work with one part keys path', function () {
      const store = new Store({ str: 'hello' });
      store.mutate((newState) => {
        newState.set('str', 'world');
        assert.deepStrictEqual(newState.get('str'), 'world');
      });
      const store1 = new Store([1]);
      store1.mutate((newState) => {
        newState.set(0, 2);
        assert.deepStrictEqual(newState.get(0), 2);
      });
    });
    it('should work with multiple parts keys path', function () {
      const store = new Store({ list: [1] });
      store.mutate((newState) => {
        newState.set(['list', 0], 2);
        assert.deepStrictEqual(newState.get(['list', 0]), 2);
      });
      const store1 = new Store([{ str: 'hello' }]);
      store1.mutate((newState) => {
        newState.set([0, 'str'], 'world');
        assert.deepStrictEqual(newState.get([0, 'str']), 'world');
      });
    });
    it('should set value with negative number key in list', function () {
      const store = new Store([1]);
      store.mutate((newState) => {
        newState.set(-1, 2);
        assert.deepStrictEqual(newState.get(0), 2);
      });
    });
    it('should set value with string key in list', function () {
      const store = new Store([1]);
      store.mutate((newState) => {
        newState.set('-1', 2);
        assert.deepStrictEqual(newState.get(0), 2);
      });
    });
    it('should work with nonexistent key', function () {
      const store = new Store();
      store.mutate((newState) => {
        newState.set('str', 'hello');
        assert.deepStrictEqual(newState.get('str'), 'hello');
      });
      const store1 = new Store();
      store1.mutate((newState) => {
        newState.set(0, 1);
        assert.deepStrictEqual(newState.get(0), 1);
      });
    });
    it('should work with undefined value', function () {
      const store = new Store({ str: 'hello' });
      store.mutate((newState) => {
        newState.set('str', undefined);
        assert.deepStrictEqual(newState.get('str'), undefined);
      });
      const store1 = new Store([1]);
      store1.mutate((newState) => {
        newState.set(0, undefined);
        assert.deepStrictEqual(newState.get(0), undefined);
      });
    });
  });

  describe('object value', function () {
    it('should work with plain object value', function () {
      const store = new Store();
      store.mutate((newState) => {
        newState.set('map', { str: 'hello' });
        assert.deepStrictEqual(newState.get(['map', 'str']), 'hello');
      });
    });
    it('should work with array value', function () {
      const store = new Store();
      store.mutate((newState) => {
        newState.set('list', [1]);
        assert.deepStrictEqual(newState.get(['list', 0]), 1);
      });
    });
    it('should work with map value', function () {
      const store = new Store();
      store.mutate((newState) => {
        newState.set('map', new Map({ str: 'hello' }));
        assert.deepStrictEqual(newState.get(['map', 'str']), 'hello');
      });
    });
    it('should work with list value', function () {
      const store = new Store();
      store.mutate((newState) => {
        newState.set('list', new List([1]));
        assert.deepStrictEqual(newState.get(['list', 0]), 1);
      });
    });
  });

  describe('callback', function () {
    it('should work on literal key with value return', function () {
      const store = new Store();
      store.mutate((newState) => {
        newState.set('str', value => 'world');
        assert.deepStrictEqual(newState.get('str'), 'world');
      });
      const store1 = new Store([]);
      store1.mutate((newState) => {
        newState.set(0, value => 1);
        assert.deepStrictEqual(newState.get(0), 1);
      });
    });
    it('should set to undefined on literal key without return value', function () {
      const store = new Store();
      store.mutate((newState) => {
        newState.set('str', (value) => {
          value = 'world';
        });
        assert.deepStrictEqual(newState.get('str'), undefined);
      });
      const store1 = new Store([]);
      store1.mutate((newState) => {
        newState.set(0, (value) => {
          value = 1;
        });
        assert.deepStrictEqual(newState.get(0), undefined);
      });
    });
    it('should work on collection key with value return', function () {
      const store = new Store({ map: { str: 'hello' }, list: [1] });
      store.mutate((newState) => {
        newState.set('map', value => value.set('str', 'world'));
        assert.deepStrictEqual(newState.get(['map', 'str']), 'world');
        newState.set('list', value => value.set(0, 1));
        assert.deepStrictEqual(newState.get(['list', 0]), 1);
      });
    });
    it('should set to undefined on collection key without return value', function () {
      const store = new Store({ map: { str: 'hello' }, list: [1] });
      store.mutate((newState) => {
        newState.set('map', (value) => {
          value.set('str', 'world');
        });
        assert.deepStrictEqual(newState.get(['map']), undefined);
        newState.set('list', (value) => {
          value.set(0, 1);
        });
        assert.deepStrictEqual(newState.get('list'), undefined);
      });
    });
  });
});

