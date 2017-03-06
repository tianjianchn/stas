
const assert = require('assert');
const { Store } = require('..');

describe('immutable-state: model', function () {
  describe('constructor', function () {
    it('should work with string fields', function () {
      const store = new Store(null, { models: [
        ['User', {
          posts: 'Post',
        }],
        ['Post', {
          user: 'User',
        }],
      ] });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: { Post: {}, User: {} } });
    });
    it('should work with model fields', function () {
      const store = new Store(null, { models: [
        ['User', {
          posts: 'Post',
        }],
        ['Post', {
          user: 'User',
        }],
      ] });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: { Post: {}, User: {} } });
    });
    it('should throw with nonexistent model in fields', function () {
      const models = [
        ['User', {
          posts: 'NonexistentModel',
        }],
      ];
      assert.throws(() => new Store(null, { models }),
        /Not found model NonexistentModel for field posts in model User/);
    });
    it('should throw without model in fields', function () {
      const models = [
        ['User', {
          posts: 1,
        }],
      ];
      assert.throws(() => new Store(null, { models }), /Need model for field posts in model User/);
    });
  });

  describe('.merge()', function () {
    it('should work with one level model and single record', function () {
      const store = new Store(null, { models: ['User'] });
      const { User } = store.models;
      store.mutate((newState) => {
        const id = User.merge({ id: 1, name: 'Tian' });
        assert.equal(id, 1);
      });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: { User: { 1: { id: 1, name: 'Tian' } } } });
    });
    it('should work with one level model and multi records', function () {
      const store = new Store(null, { models: ['User'] });
      const { User } = store.models;
      store.mutate((newState) => {
        const ids = User.merge([{ id: 1, name: 'Tian' }, { id: 2, name: 'Jian' }]);
        assert.deepStrictEqual(ids, [1, 2]);
      });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: {
        User: { 1: { id: 1, name: 'Tian' }, 2: { id: 2, name: 'Jian' } } } });
    });
    it('should work with null', function () {
      const store = new Store(null, { models: ['User'] });
      const { User } = store.models;
      store.mutate((newState) => {
        const result = User.merge(null);
        assert.deepStrictEqual(result, null);
      });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: { User: { } } });
    });
    it('should work with nested models and single record', function () {
      const models = ['User', ['Post', { user: 'User' }]];
      const store = new Store(null, { models });
      const { Post } = store.models;
      store.mutate((newState) => {
        const id = Post.merge({ id: 1, title: 'Hello', user: { id: 2, name: 'Tian' } });
        assert.equal(id, 1);
      });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: {
        User: { 2: { id: 2, name: 'Tian' } },
        Post: { 1: { id: 1, title: 'Hello', user: 2 } } } });
    });
    it('should work with nested models and multi records', function () {
      const models = ['Post', ['User', { posts: 'Post' }]];
      const store = new Store(null, { models });
      const { User } = store.models;
      store.mutate((newState) => {
        const id = User.merge({ id: 1, name: 'Tian',
          posts: [{ id: 2, title: 'Hello' }, { id: 3, title: 'World' }] });
        assert.equal(id, 1);
      });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: {
        User: { 1: { id: 1, name: 'Tian', posts: [2, 3] } },
        Post: { 2: { id: 2, title: 'Hello' }, 3: { id: 3, title: 'World' } } } });
    });
    it('should work with circular nested models', function () {
      const models = [['Post', { user: 'User' }], ['User', { posts: 'Post' }]];
      const store = new Store(null, { models });
      const { User } = store.models;
      store.mutate((newState) => {
        const id = User.merge({ id: 1, name: 'Tian',
          posts: [
            { id: 2, title: 'Hello', user: { id: 2, name: 'Jian' } },
            { id: 3, title: 'World', user: { id: 1, name: 'Tian' } }] });
        assert.equal(id, 1);
      });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: {
        User: { 1: { id: 1, name: 'Tian', posts: [2, 3] }, 2: { id: 2, name: 'Jian' } },
        Post: { 2: { id: 2, title: 'Hello', user: 2 }, 3: { id: 3, title: 'World', user: 1 } },
      } });
    });
    it('should merge with existent record', function () {
      const store = new Store({ __models__: {
        User: { 1: { id: 1, name: 'Tian', addr: 'Beijing' } } },
      }, { models: ['User'] });
      const { User } = store.models;
      store.mutate((newState) => {
        User.merge({ id: 1, name: 'Jian' });
      });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: {
        User: { 1: { id: 1, name: 'Jian', addr: 'Beijing' } } } });
    });
  });

  describe('.get()/.mget()', function () {
    it('should get the record outside or inside store.mutate()', function () {
      const store = new Store({ __models__: {
        User: { 1: { id: 1, name: 'Tian' } } },
      }, { models: ['User'] });
      const { User } = store.models;
      assert.deepStrictEqual(User.get(1).toJSON(), { id: 1, name: 'Tian' });
      store.mutate((newState) => {
        assert.deepStrictEqual(User.get(1).toJSON(), { id: 1, name: 'Tian' });
      });
    });
    it('should get multiple records', function () {
      const store = new Store({ __models__: {
        User: { 1: { id: 1, name: 'Tian' }, 2: { id: 2, name: 'Jian' } } },
      }, { models: ['User'] });
      const { User } = store.models;
      assert.deepStrictEqual(User.mget(1).map(val => val.toJSON()), [{ id: 1, name: 'Tian' }]);
      assert.deepStrictEqual(User.mget([1]).map(val => val.toJSON()), [{ id: 1, name: 'Tian' }]);
      assert.deepStrictEqual(User.mget(1, 2).map(val => val.toJSON()),
        [{ id: 1, name: 'Tian' }, { id: 2, name: 'Jian' }]);
      assert.deepStrictEqual(User.mget([1, 2]).map(val => val.toJSON()),
        [{ id: 1, name: 'Tian' }, { id: 2, name: 'Jian' }]);
      assert.deepStrictEqual(User.mget([1], 2).map(val => val.toJSON()),
        [{ id: 1, name: 'Tian' }, { id: 2, name: 'Jian' }]);
      store.mutate((newState) => {
        assert.deepStrictEqual(User.mget(1).map(val => val.toJSON()), [{ id: 1, name: 'Tian' }]);
      });
    });
  });

  describe('.set()', function () {
    it('should set the id with new record', function () {
      const store = new Store({ __models__: {
        User: { 1: { id: 1, name: 'Tian' } } },
      }, { models: ['User'] });
      const { User } = store.models;
      store.mutate((newState) => {
        User.set(1, { id: 1, name: 'Jian' });
      });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: {
        User: { 1: { id: 1, name: 'Jian' } } } });
    });
  });

  describe('.remove()', function () {
    it('should remove record', function () {
      const store = new Store({ __models__: {
        User: { 1: { id: 1, name: 'Tian' } } },
      }, { models: ['User'] });
      const { User } = store.models;
      store.mutate((newState) => {
        User.remove(1);
      });
      assert.deepStrictEqual(store.state.toJSON(), { __models__: {
        User: {} } });
    });
  });
});

