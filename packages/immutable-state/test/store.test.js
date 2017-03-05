
const assert = require('assert');
const Store = require('..');

describe('immutable-state: store', function () {
  describe('constructor', function () {
    it('should work with empty initial data', function () {
      assert.deepStrictEqual(new Store().getState().toJSON(), {});
      assert.deepStrictEqual(new Store(null).getState().toJSON(), {});
      assert.deepStrictEqual(new Store(undefined).getState().toJSON(), {});
      assert.deepStrictEqual(new Store(false).getState().toJSON(), {});
      assert.deepStrictEqual(new Store(0).getState().toJSON(), {});
      assert.deepStrictEqual(new Store('').getState().toJSON(), {});
    });
    it('should work with initial data', function () {
      assert.deepStrictEqual(new Store({}).getState().toJSON(), {});
      assert.deepStrictEqual(new Store({ num: 1, str: 'hello', bool: true }).getState().toJSON(), { num: 1, str: 'hello', bool: true });
      assert.deepStrictEqual(new Store({ list: [1, 2], map: { str: 'hello' } }).getState().toJSON(), { list: [1, 2], map: { str: 'hello' } });

      assert.deepStrictEqual(new Store([]).getState().toJSON(), []);
      assert.deepStrictEqual(new Store([1, 2]).getState().toJSON(), [1, 2]);
      assert.deepStrictEqual(new Store(['h', 'e', 'l']).getState().toJSON(), ['h', 'e', 'l']);
      assert.deepStrictEqual(new Store([true, [1, 2], 'hello', { name: 'Jack' }]).getState().toJSON(), [true, [1, 2], 'hello', { name: 'Jack' }]);
    });
    it('should work with invalid initial data', function () {
      assert.throws(() => new Store(new Date()), /Invalid initial state when creating store/);
      assert.throws(() => new Store(1), /Invalid initial state when creating store/);
      assert.throws(() => new Store('h'), /Invalid initial state when creating store/);
      assert.throws(() => new Store(true), /Invalid initial state when creating store/);
    });
  });

  describe('.mutate()', function () {
    it('should throw with invalid callback', function () {
      const store = new Store();
      assert.throws(() => store.mutate(), /Need callback function in store.mutate\(\)/);
      assert.throws(() => store.mutate(1), /Need callback function in store.mutate\(\)/);
    });
    it('should throw with inner calling mutate()', function () {
      const store = new Store();
      store.mutate((newState) => {
        assert.throws(() => store.mutate(() => null), /Cannot start another mutation operation/);
      });
    });
    it('should throw with change outside store.mutate()', function (done) {
      const store = new Store();
      assert.throws(() => store.getState().set('str', 'hello'), /Cannot mutate the state outside store.mutate\(\)/);
      store.mutate((newState) => {
        setTimeout(() => {
          assert.throws(() => store.getState().set('str', 'hello'), /Cannot mutate the state outside store.mutate\(\)/);
          done();
        });
      });
    });
    it('should work without reassign and return newState', function () {
      const store = new Store();
      store.mutate((newState) => {
        newState.set('str', 'hello');
        newState.set('str', 'world');
      });
      assert.deepStrictEqual(store.getState().get('str'), 'world');
    });
  });
});

