
const assert = require('assert');
const { createStore } = require('..');// eslint-disable-line no-shadow

describe('immutable-state: immutable', function () {
  describe('basic', function () {
    it('should not change state without change', function () {
      const store = createStore();
      const prevState = store.getState(),
        prevJSON = prevState.toJSON();

      store.mutate((newState) => {
        assert.notEqual(newState, prevState);
        assert.strictEqual(store.getState(), prevState);
        assert.strictEqual(newState.toJSON(), prevJSON);
        assert.strictEqual(store.getState().toJSON(), prevJSON);
      });

      assert.strictEqual(store.getState(), prevState);
      assert.strictEqual(store.getState().toJSON(), prevJSON);
      assert.deepStrictEqual(prevJSON, {});
    });
    it('should not change old state', function () {
      const store = createStore({ str: 'hello' });
      const prevState = store.getState(),
        prevJSON = prevState.toJSON();

      store.mutate((newState) => {
        newState.set('str', 'world');

        assert.strictEqual(store.getState(), prevState);
        assert.strictEqual(store.getState().toJSON(), prevJSON);
        assert.strictEqual(prevState.toJSON(), prevJSON);
        assert.deepStrictEqual(prevJSON, { str: 'hello' });

        assert.notEqual(newState.toJSON(), prevJSON);
        assert.deepStrictEqual(newState.toJSON(), { str: 'world' });
      });
    });
    it('should not change state when error occurred', function () {
      const store = createStore({ str: 'hello' });
      const
        prevState = store.getState(),
        prevJSON = prevState.toJSON();

      assert.throws(() => store.mutate((newState) => {
        newState.set('str', 'world');
        throw new Error('1234');
      }), /1234/);

      assert.strictEqual(store.getState(), prevState);
      assert.strictEqual(store.getState().toJSON(), prevJSON);
    });
    it('should change state even with mutation reverted', function () {
      const store = createStore({ str: undefined });
      const prevState = store.getState(),
        prevJSON = prevState.toJSON();

      store.mutate((newState) => {
        newState.set('str', 'hello');
        newState.set('str', undefined);

        assert.notEqual(newState, store.getState());
      });

      const currState = store.getState(),
        currJSON = currState.toJSON();
      assert.notEqual(currState, prevState);
      assert.notEqual(currJSON, prevJSON);
      assert.deepStrictEqual(currJSON, prevJSON);
      assert.deepStrictEqual(prevJSON, { str: undefined });
    });
  });
});
