
const assert = require('assert');
const { createStore } = require('..');

describe('immutable-state: store', function () {
  describe('constructor', function () {
    it('should work with empty initial data', function () {
      assert.deepStrictEqual(createStore().getState().toJSON(), {});
      assert.deepStrictEqual(createStore(null).getState().toJSON(), {});
      assert.deepStrictEqual(createStore(undefined).getState().toJSON(), {});
      assert.deepStrictEqual(createStore(false).getState().toJSON(), {});
      assert.deepStrictEqual(createStore(0).getState().toJSON(), {});
      assert.deepStrictEqual(createStore('').getState().toJSON(), {});
    });
    it('should work with initial data', function () {
      assert.deepStrictEqual(createStore({}).getState().toJSON(), {});
      assert.deepStrictEqual(createStore({ num: 1, str: 'hello', bool: true }).getState().toJSON(), { num: 1, str: 'hello', bool: true });
      assert.deepStrictEqual(createStore({ list: [1, 2], map: { str: 'hello' } }).getState().toJSON(), { list: [1, 2], map: { str: 'hello' } });

      assert.deepStrictEqual(createStore([]).getState().toJSON(), []);
      assert.deepStrictEqual(createStore([1, 2]).getState().toJSON(), [1, 2]);
      assert.deepStrictEqual(createStore(['h', 'e', 'l']).getState().toJSON(), ['h', 'e', 'l']);
      assert.deepStrictEqual(createStore([true, [1, 2], 'hello', { name: 'Jack' }]).getState().toJSON(), [true, [1, 2], 'hello', { name: 'Jack' }]);
    });
    it('should work with invalid initial data', function () {
      assert.throws(() => createStore(new Date()), /Invalid initial state when creating store/);
      assert.throws(() => createStore(1), /Invalid initial state when creating store/);
      assert.throws(() => createStore('h'), /Invalid initial state when creating store/);
      assert.throws(() => createStore(true), /Invalid initial state when creating store/);
    });
  });

  describe('.mutate()', function () {
    it('should throw with invalid callback', function () {
      const store = createStore();
      assert.throws(() => store.mutate(), /Need callback function in store.mutate\(\)/);
      assert.throws(() => store.mutate(1), /Need callback function in store.mutate\(\)/);
    });
    it('should throw with inner calling mutate()', function () {
      const store = createStore();
      store.mutate((newState) => {
        assert.throws(() => store.mutate(() => null), /Cannot start another mutation operation/);
      });
    });
    it('should throw with change outside store.mutate()', function (done) {
      const store = createStore();
      assert.throws(() => store.getState().set('str', 'hello'), /Cannot mutate the state outside store.mutate\(\)/);
      store.mutate((newState) => {
        setTimeout(() => {
          assert.throws(() => store.getState().set('str', 'hello'), /Cannot mutate the state outside store.mutate\(\)/);
          done();
        });
      });
    });
    it('should work without reassign and return newState', function () {
      const store = createStore();
      store.mutate((newState) => {
        newState.set('str', 'hello');
        newState.set('str', 'world');
      });
      assert.deepStrictEqual(store.getState().get('str'), 'world');
    });
  });
});

