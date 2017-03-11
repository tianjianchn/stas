
import assert from 'assert';
import immutable from '..';
import { shouldImmutable, shouldThrow } from './helper';
import { stringify } from '../dist/util';

describe('plain-immutable: .remove()/.removeIn()', function () {
  describe('key/key path', function () {
    it('should work with valid key/key path', function () {
      [1, -1, 0, 'a', '0'].forEach((key) => {
        immutable({}).remove(key);
        immutable([]).remove(key);
      });

      [1, -1, 0, 'a', '0', [1], [-1], [0], ['a'], ['0']].forEach((keyPath) => {
        immutable({}).removeIn(keyPath);
        immutable([]).removeIn(keyPath);
      });
    });
    it('should throw with invalid key/key path', function () {
      shouldRemoveThrow();
      [null, undefined, false, true, new Date(), {}, [], ''].forEach(shouldRemoveThrow);
      function shouldRemoveThrow(key) {
        const msg = `Invalid key: ${stringify(key)}, expect number or non-empty string`;
        const obj = immutable({});
        shouldThrow(() => obj.remove(key), msg);
        const arr = immutable([]);
        shouldThrow(() => arr.remove(key), msg);
      }

      shouldRemoveInThrow();
      [
        null, undefined, false, true, new Date(), {}, '',
        [], [null], [undefined], [false], [true], [''], [new Date()], [{}], [[]],
      ].forEach(shouldRemoveInThrow);
      function shouldRemoveInThrow(keyPath) {
        if (!Array.isArray(keyPath)) keyPath = [keyPath];
        const msg = `Invalid key path: ${stringify(keyPath)}, expect number or non-empty string in array`;
        const obj = immutable({});
        shouldThrow(() => obj.removeIn(keyPath), msg);
        const arr = immutable([]);
        shouldThrow(() => arr.removeIn(keyPath), msg);
      }
    });
    it('should do nothing with non-existent key/key path', function () {
      {
        const obj = immutable({ a: 1 });
        const obj1 = obj.remove('b');
        assert.strictEqual(obj1, obj);
        assert.deepStrictEqual(obj, { a: 1 });

        const arr = immutable([1]);
        const arr1 = arr.remove(1);
        assert.strictEqual(arr1, arr);
        assert.deepStrictEqual(arr, [1]);
      }

      {
        const obj = immutable({ a: 1 });
        const obj1 = obj.removeIn('b');
        assert.strictEqual(obj1, obj);
        assert.deepStrictEqual(obj, { a: 1 });

        const arr = immutable([1]);
        const arr1 = arr.removeIn(1);
        assert.strictEqual(arr1, arr);
        assert.deepStrictEqual(arr, [1]);
      }
    });
  });

  describe('.removeIn()', function () {
    it('should throw when set on non-object value', function () {
      const obj = immutable({ a: 1 });
      shouldThrow(() => obj.removeIn(['a', 'b', 'c']), 'Cannot update on non-object value at [a]: 1');
    });
    it('should work with one-key path', function () {
      const obj = immutable({ a: 1 });
      const obj1 = obj.removeIn('a');
      shouldImmutable(obj, { a: 1 }, obj1, {});

      const arr = immutable([1]);
      const arr1 = arr.removeIn(0);
      shouldImmutable(arr, [1], arr1, []);
      assert.strictEqual(arr1.length, 0);
    });
    it('should work with multi-keys path', function () {
      const obj = immutable({ a: { b: 1 } });
      const obj1 = obj.removeIn(['a', 'b']);
      shouldImmutable(obj, { a: { b: 1 } }, obj1, { a: {} });

      const arr = immutable([[1]]);
      const arr1 = arr.removeIn([0, 0]);
      shouldImmutable(arr, [[1]], arr1, [[]]);
      assert.strictEqual(arr1[0].length, 0);
    });
  });
});

