
import assert from 'assert';
import Store, { isImmutable } from '..';
import { shouldThrow, shouldImmutable } from './helper';
import { stringify } from '../dist/util';

describe('stas-try-2nd: model', function () {
  describe('constructor', function () {
    it('should throw with invalid params', function () {
      const store = new Store();

      checkName();
      [1, '', true, null, undefined, [], {}].forEach(checkName);
      function checkName(name) {
        shouldThrow(() => store.model(name), `Invalid name: ${stringify(name)}, expect string`);
      }

      [1, '', true, null, []].forEach(checkAttr);
      function checkAttr(attributes) {
        shouldThrow(() => store.model('User', attributes), `Invalid attributes: ${stringify(attributes)}, expect plain object`);
      }
    });
    it('should throw with valid params', function () {
      const store = new Store();

      store.model('1', undefined);
      store.model('a', {});
      const A = store.model('A');
      assert.deepStrictEqual(A.attributes, {});
    });
    it('should throw with redefining model', function () {
      const store = new Store();

      const User = store.model('User');
      const User1 = store.model('User');
      assert.strictEqual(User, User1);

      shouldThrow(() => store.model('User', {}), 'Cannot redefine model: User');
    });
  });

  describe('.ensure()', function () {
    it('should create records container after ensure()', function () {
      const store = new Store();
      assert.deepStrictEqual(store.database, {});
      assert.deepStrictEqual(store.state, undefined);

      const User = store.model('User');
      assert.deepStrictEqual(store.database, {});
      assert.deepStrictEqual(store.state, undefined);

      User.ensure();
      assert.deepStrictEqual(store.database, { User: {} });
      assert.deepStrictEqual(store.state, undefined);
    });
    it('should work with string model in attributes', function () {
      const store = new Store();
      const User = store.model('User', { posts: ['Post'] });
      const Post = store.model('Post', { author: 'User' });
      User.ensure();
      Post.ensure();
      assert.deepStrictEqual(store.state, undefined);
      assert.deepStrictEqual(store.database, { User: {}, Post: {} });
    });
    it('should work with model in attributes', function () {
      const store = new Store();
      const User = store.model('User');
      const Post = store.model('Post', { author: User });
      User.ensure();
      Post.ensure();
      assert.deepStrictEqual(store.state, undefined);
      assert.deepStrictEqual(store.database, { User: {}, Post: {} });


      const store1 = new Store();
      const Post1 = store1.model('Post1');
      const User1 = store1.model('User1', { posts: [Post1] });
      User1.ensure();
      Post1.ensure();
      assert.deepStrictEqual(store1.state, undefined);
      assert.deepStrictEqual(store1.database, { User1: {}, Post1: {} });
    });
    it('should throw with invalid model in attributes', function () {
      const store = new Store();
      check();
      [1, false, null, undefined, [], {}, [1], [null], [undefined], [false], ['Post'], 'Post'].forEach(check);
      function check(attr, index) {
        const name = `User${index}`;
        const User = store.model(name, { key: attr });
        shouldThrow(() => User.ensure(), `Invalid attribute at key in ${name}: ${stringify(attr)}, expect a model(or string) that exists`);
      }
    });
  });

  describe('.merge()', function () {
    it('should throw when merging outside .mutate()', function () {
      const store = new Store();
      const User = store.model('User');
      shouldThrow(() => User.merge({ id: 1 }), 'Cannot mutate the records of model outside store.mutate()');
    });

    describe('single model', function () {
      it('should work with single record', function () {
        shouldImmutable((store) => {
          const User = store.model('User');
          store.mutate((state) => {
            const id = User.merge({ id: 1, name: 'Tian' });
            assert.equal(id, 1);
          });
          assert.deepStrictEqual(store.database, { User: { 1: { id: 1, name: 'Tian' } } });
        }, { stateChanged: false });
      });
      it('should work with multiple records', function () {
        shouldImmutable((store) => {
          const User = store.model('User');
          store.mutate((state) => {
            const ids = User.merge([{ id: 1, name: 'Tian' }, { id: 2, name: 'Jian' }]);
            assert.deepStrictEqual(ids, [1, 2]);
          });
          assert.deepStrictEqual(store.database, { User: {
            1: { id: 1, name: 'Tian' },
            2: { id: 2, name: 'Jian' },
          } });
        }, { stateChanged: false });
      });
      it('should return original if not a record', function () {
        shouldImmutable((store) => {
          const User = store.model('User');
          store.mutate((state) => {
            const ids = User.merge([null, undefined, '1', true, 0, 1, {}, []]);
            assert.deepStrictEqual(ids, [null, undefined, '1', true, 0, 1, {}, []]);
          });
          assert.deepStrictEqual(store.database, { });
        }, { stateChanged: false, databaseChanged: false });
      });
      it('should merge with existent record', function () {
        shouldImmutable((store) => {
          const User = store.model('User');
          store.mutate((state) => {
            const id = User.merge({ id: 1, name: 'Jian' });
            assert.equal(id, 1);
          });
          assert.deepStrictEqual(store.database, { User: { 1: { id: 1, name: 'Jian' } } });
        }, { stateChanged: false, database: { User: { 1: { id: 1, name: 'Tian' } } } });
      });
      it('should not trigger change when merging same record', function () {
        const user = { id: 1, name: 'Tian' };
        shouldImmutable((store) => {
          const User = store.model('User');
          store.mutate((state) => {
            const id = User.merge(user);
            assert.equal(id, 1);
          });
          assert.deepStrictEqual(store.database, { User: { 1: user } });
        }, { stateChanged: false, database: { User: { 1: user } }, databaseChanged: false });
      });
    });
    describe('nested models', function () {
      it('should work with single record', function () {
        shouldImmutable((store) => {
          const User = store.model('User');
          const Post = store.model('Post', { author: User });
          store.mutate((state) => {
            const id = Post.merge({ id: 1, title: 'Hello', author: { id: 2, name: 'Tian' } });
            assert.equal(id, 1);
          });
          assert.deepStrictEqual(store.database, {
            User: { 2: { id: 2, name: 'Tian' } },
            Post: { 1: { id: 1, title: 'Hello', author: 2 } },
          });
        }, { stateChanged: false });
      });
      it('should work with multiple records', function () {
        shouldImmutable((store) => {
          const User = store.model('User', { posts: ['Post'] });
          store.model('Post');
          store.mutate((state) => {
            const id = User.merge({ id: 1, name: 'Tian',
              posts: [{ id: 2, title: 'Hello' }, { id: 3, title: 'World' }] });
            assert.equal(id, 1);
          });
          assert.deepStrictEqual(store.database, {
            User: { 1: { id: 1, name: 'Tian', posts: [2, 3] } },
            Post: { 2: { id: 2, title: 'Hello' }, 3: { id: 3, title: 'World' } },
          });
        }, { stateChanged: false });
      });
      it('should convert to empty id array if attribute is array but value is null', function () {
        shouldImmutable((store) => {
          const User = store.model('User', { posts: ['Post'] });
          store.model('Post');
          store.mutate((state) => {
            const id = User.merge({ id: 1, name: 'Tian' });
            assert.equal(id, 1);
          });
          assert.deepStrictEqual(store.database, { User: { 1: { id: 1, name: 'Tian', posts: [] } } });
        }, { stateChanged: false });
      });
      it('should convert to id array if attribute is array but value is not', function () {
        shouldImmutable((store) => {
          const User = store.model('User', { posts: ['Post'] });
          store.model('Post');
          store.mutate((state) => {
            const id = User.merge({ id: 1, name: 'Tian', posts: { id: 1, title: 'Hello' } });
            assert.equal(id, 1);
          });
          assert.deepStrictEqual(store.database, {
            User: { 1: { id: 1, name: 'Tian', posts: [1] } },
            Post: { 1: { id: 1, title: 'Hello' } },
          });
        }, { stateChanged: false });
      });
      it('should convert to id if attribute is not array but value is', function () {
        shouldImmutable((store) => {
          store.model('User');
          const Post = store.model('Post', { author: 'User' });
          store.mutate((state) => {
            const id = Post.merge({ id: 1, title: 'Hello', author: [{ id: 1, name: 'Tian' }, { id: 2, name: 'Jian' }] });
            assert.equal(id, 1);
          });
          assert.deepStrictEqual(store.database, {
            User: { 1: { id: 1, name: 'Tian' } },
            Post: { 1: { id: 1, title: 'Hello', author: 1 } },
          });
        }, { stateChanged: false });
      });
      it('should work with circular nested models', function () {
        shouldImmutable((store) => {
          const User = store.model('User', { posts: ['Post'] });
          store.model('Post', { author: 'User' });
          store.mutate((state) => {
            const id = User.merge({ id: 1, name: 'Tian',
              posts: [
                { id: 2, title: 'Hello', author: { id: 2, name: 'Jian' } },
                { id: 3, title: 'World', author: { id: 1, name: 'Tian' } }] });
            assert.equal(id, 1);
          });
          assert.deepStrictEqual(store.database, {
            User: { 1: { id: 1, name: 'Tian', posts: [2, 3] }, 2: { id: 2, name: 'Jian', posts: [] } },
            Post: { 2: { id: 2, title: 'Hello', author: 2 }, 3: { id: 3, title: 'World', author: 1 } },
          });
        }, { stateChanged: false });
      });
    });
  });

  describe('.get()', function () {
    it('should get one record outside or inside store.mutate()', function () {
      const store = new Store(null, { database: { User: { 1: { id: 1, name: 'Tian' } } } });
      const User = store.model('User');

      assert.deepStrictEqual(User.get(1), { id: 1, name: 'Tian' });
      assert(isImmutable(User.get(1)));
      store.mutate((state) => {
        assert.deepStrictEqual(User.get(1), { id: 1, name: 'Tian' });
      });
    });
    it('should get multiple records', function () {
      const store = new Store(null, { database: { User: { 1: { id: 1, name: 'Tian' }, 2: { id: 2, name: 'Jian' } } } });
      const User = store.model('User');

      assert.deepStrictEqual(User.get([1, 2]), [{ id: 1, name: 'Tian' }, { id: 2, name: 'Jian' }]);
      assert.deepStrictEqual(User.get([1]), [{ id: 1, name: 'Tian' }]);
      assert(isImmutable(User.get([1])));
      store.mutate((state) => {
        assert.deepStrictEqual(User.get([1]), [{ id: 1, name: 'Tian' }]);
      });
    });
  });

  describe('.set()', function () {
    it('should throw when merging outside .mutate()', function () {
      const store = new Store();
      const User = store.model('User');
      shouldThrow(() => User.set({ id: 1 }), 'Cannot mutate the records of model outside store.mutate()');
    });
    it('should replace record', function () {
      shouldImmutable((store) => {
        const User = store.model('User');
        store.mutate(() => {
          User.set({ id: 1, name: 'Jian' });
          assert.deepStrictEqual(User.get(1), { id: 1, name: 'Jian' });
        });
        assert.deepStrictEqual(store.database, { User: { 1: { id: 1, name: 'Jian' } } });
      }, { stateChanged: false, database: { User: { 1: { id: 1, name: 'Tian' } } } });
    });
    it('should not trigger change without a record', function () {
      shouldImmutable((store) => {
        const User = store.model('User');
        store.mutate(() => {
          User.set(undefined);
          User.set(null);
          User.set(true);
          User.set(1);
          User.set('');
          User.set([]);
          User.set({});
          User.set({ name: 'Tian' });
        });
        assert.deepStrictEqual(store.database, { });
      }, { stateChanged: false, databaseChanged: false });
    });
    it('should not trigger change when setting same record', function () {
      const user = { id: 1, name: 'Tian' };
      shouldImmutable((store) => {
        const User = store.model('User');
        store.mutate(() => {
          User.set(user);
          assert.strictEqual(User.get(1), user);
        });
        assert.deepStrictEqual(store.database, { User: { 1: { id: 1, name: 'Tian' } } });
      }, { stateChanged: false, database: { User: { 1: user } }, databaseChanged: false });
    });
  });

  describe('.remove()', function () {
    it('should throw when merging outside .mutate()', function () {
      const store = new Store(null, { database: { User: { 1: { id: 1 } } } });
      const User = store.model('User');
      shouldThrow(() => User.remove(1), 'Cannot mutate the records of model outside store.mutate()');
    });
    it('should remove existent record', function () {
      shouldImmutable((store) => {
        const User = store.model('User');
        store.mutate(() => {
          User.remove(1);
          assert.strictEqual(User.get(1), null);
        });
        assert.deepStrictEqual(store.database, { User: { } });
      }, { stateChanged: false, database: { User: { 1: { id: 1, name: 'Tian' } } } });
    });
    it('should do nothing with non-existent record', function () {
      shouldImmutable((store) => {
        const User = store.model('User');
        store.mutate(() => {
          User.remove(1);
          assert.strictEqual(User.get(1), null);
          User.remove(null);
          User.remove(undefined);
          User.remove(new Date());
          User.remove([]);
          User.remove({});
        });
        assert.deepStrictEqual(store.database, { User: {} });
      }, { stateChanged: false, databaseChanged: false });
    });
  });
});
