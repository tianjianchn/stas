
import assert from 'assert';
import Store, { immutable, isImmutable, createRouter } from '..';
import { shouldThrow, shouldImmutable } from './helper';
import { stringify } from '../dist/util';

describe('stas-try-2nd: store', function () {
  describe('constructor', function () {
    it('should throw with invalid initial state and database', function () {
      [1, true, '1', new Date(), function () {}].forEach(checkState);
      function checkState(initialState) {
        shouldThrow(() => new Store(initialState), `Invalid state: ${stringify(initialState)}, expect object or array`);
      }

      [1, true, '1', new Date(), function () {}, []].forEach(checkDatabase);
      function checkDatabase(database) {
        shouldThrow(() => new Store(null, { database }), `Invalid database: ${stringify(database)}, expect plain object`);
      }
    });
    it('should throw with valid initial state and database', function () {
      /* eslint-disable no-new */
      new Store(null, { database: undefined });
      new Store(undefined, { database: null });
      new Store([]);
      new Store({});
      /* eslint-enable no-new */
    });
    it('should work with initial json state', function () {
      const store = new Store({ str: 'hello' });
      assert.deepStrictEqual(store.state.str, 'hello');
      assert.deepStrictEqual(store.state, { str: 'hello' });
    });
    it('should work with initial immutable state', function () {
      const store = new Store(immutable({ str: 'hello' }));
      assert.deepStrictEqual(store.state.str, 'hello');
      assert.deepStrictEqual(store.state, { str: 'hello' });
    });
    it('should work with initial database', function () {
      const store = new Store(null, { database: { User: { 1: { id: 1 } } } });
      const User = store.model('User');
      assert.deepStrictEqual(store.state, null);
      assert.deepStrictEqual(store.database, { User: { 1: { id: 1 } } });
      assert.deepStrictEqual(User.get(1), { id: 1 });
    });
  });

  describe('.mutate()', function () {
    it('should trigger change after state mutated', function () {
      shouldImmutable((store) => {
        store.mutate((state) => {
          assert(isImmutable(state));
          return state.set('str', 'world');
        });
        assert.deepStrictEqual(store.state, { str: 'world' });
      }, { state: { str: 'hello' } });
    });
    it('should not trigger change while state not mutated', function () {
      shouldImmutable((store) => {
        store.mutate(state => state);
        assert.deepStrictEqual(store.state, { str: 'hello' });
      }, { state: { str: 'hello' }, stateChanged: false, databaseChanged: false });
    });
    it('should trigger change after state and database both mutated', function () {
      shouldImmutable((store) => {
        const User = store.model('User');
        store.mutate((state) => {
          assert(isImmutable(state));
          User.set({ id: 1 });
          return state.set('str', 'world');
        });
        assert.deepStrictEqual(store.state, { str: 'world' });
        assert.deepStrictEqual(store.database, { User: { 1: { id: 1 } } });
      }, { state: { str: 'hello' } });
    });
    it('should trigger change after database mutated', function () {
      shouldImmutable((store) => {
        const User = store.model('User');
        store.mutate((state) => {
          assert(isImmutable(state));
          User.set({ id: 1 });
          return state;
        });
        assert.deepStrictEqual(store.state, { str: 'hello' });
        assert.deepStrictEqual(store.database, { User: { 1: { id: 1 } } });
      }, { state: { str: 'hello' }, stateChanged: false });
    });
  });

  describe('.setState()', function () {
    it('should trigger change', function () {
      shouldImmutable((store) => {
        store.setState({ str: 'world' });
        assert.deepStrictEqual(store.state, { str: 'world' });
      }, { state: { str: 'hello' }, databaseChanged: false });
    });
    it('should not trigger change while set same state', function () {
      const state = { str: 'hello' };
      shouldImmutable((store) => {
        store.setState(state);
        assert.deepStrictEqual(store.state, { str: 'hello' });
      }, { state, databaseChanged: false, stateChanged: false });
    });
    it('should trigger change while only set database', function () {
      shouldImmutable((store) => {
        store.setState(store.state, { database: { User: { 1: { id: 1 } } } });
        assert.deepStrictEqual(store.state, undefined);
        assert.deepStrictEqual(store.database, { User: { 1: { id: 1 } } });
      }, { databaseChanged: true, stateChanged: false });
    });
  });

  describe('middleware', function () {
    it('should work with middleware', function () {
      shouldImmutable((store, done) => {
        store.use((req, resp, next) => {
          if (req.url === '/a') {
            setTimeout(() => {
              store.mutate(state => state.set('str', 'world'));
              assert.deepStrictEqual(store.state, { str: 'world' });
              done();
            }, 10);
          }
        });
        store.dispatch('/a');
      }, { state: { str: 'hello' } });
    });
    it('should work with router', function () {
      shouldImmutable((store, done) => {
        store.use(createRouter().all('/a', (req, resp, next) => {
          setTimeout(() => {
            store.mutate(state => state.set('str', 'world'));
            assert.deepStrictEqual(store.state, { str: 'world' });
            done();
          }, 10);
        }));
        store.dispatch('/a');
      }, { state: { str: 'hello' } });
    });
  });
});
