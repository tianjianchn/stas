
import assert from 'assert';
import immutable from '..';
import { shouldImmutable, shouldThrow } from './helper';
import { stringify } from '../dist/util';

describe('plain-immutable: .set()/.setIn', function () {
  describe('key/key path', function () {
    it('should work with valid key/key path', function () {
      [1, -1, 0, 'a', '0'].forEach((key) => {
        immutable({}).set(key);
        immutable([]).set(key);
      });

      [1, -1, 0, 'a', '0', [1], [-1], [0], ['a'], ['0']].forEach((keyPath) => {
        immutable({}).setIn(keyPath);
        immutable([]).setIn(keyPath);
      });
    });
    it('should throw with invalid key/key path', function () {
      shouldSetThrow();
      [null, undefined, false, true, new Date(), {}, [], ''].forEach(shouldSetThrow);
      function shouldSetThrow(key) {
        const msg = `Invalid key: ${stringify(key)}, expect number or non-empty string`;
        const obj = immutable({});
        shouldThrow(() => obj.set(key), msg);
        const arr = immutable([]);
        shouldThrow(() => arr.set(key), msg);
      }

      shouldSetInThrow();
      [
        null, undefined, false, true, new Date(), {}, '',
        [], [null], [undefined], [false], [true], [''], [new Date()], [{}], [[]],
      ].forEach(shouldSetInThrow);
      function shouldSetInThrow(keyPath) {
        if (!Array.isArray(keyPath)) keyPath = [keyPath];
        const msg = `Invalid key path: ${stringify(keyPath)}, expect number or non-empty string in array`;
        const obj = immutable({});
        shouldThrow(() => obj.setIn(keyPath), msg);
        const arr = immutable([]);
        shouldThrow(() => arr.setIn(keyPath), msg);
      }
    });
    it('should throw when set on non-object value', function () {
      const obj = immutable({ a: 1 });
      shouldThrow(() => obj.setIn(['a', 'b'], 1), 'Cannot update on non-object value at [a]: 1');
    });
    it('should create object when key not existent', function () {
      const obj = immutable({ });
      const obj1 = obj.setIn('a', 1);
      assert.deepStrictEqual(obj1, { a: 1 });
      const obj2 = obj.setIn(['a', 'b'], 1);
      assert.deepStrictEqual(obj2, { a: { b: 1 } });
    });
  });

  describe('literal value', function () {
    it('should work with one-key path', function () {
      const obj = immutable({ a: 1 });
      const obj1 = obj.setIn('a', 2);
      shouldImmutable(obj, { a: 1 }, obj1, { a: 2 });

      const arr = immutable([1]);
      const arr1 = arr.setIn(0, 2);
      shouldImmutable(arr, [1], arr1, [2]);
    });
    it('should not change with same value', function () {
      const obj = immutable({ a: 1 });
      const obj1 = obj.setIn('a', 1);
      assert.strictEqual(obj, obj1);

      const arr = immutable([1]);
      const arr1 = arr.setIn(0, 1);
      assert.strictEqual(arr, arr1);
    });
    it('should work with multi-keys path', function () {
      const obj = immutable({ a: [1] });
      const obj1 = obj.setIn(['a', 0], 2);
      shouldImmutable(obj, { a: [1] }, obj1, { a: [2] });

      const arr = immutable([{ a: 1 }]);
      const arr1 = arr.setIn([0, 'a'], 2);
      shouldImmutable(arr, [{ a: 1 }], arr1, [{ a: 2 }]);
    });
    it('should work with string key in array', function () {
      const arr = immutable([1]);
      const arr1 = arr.setIn('0', 2);
      shouldImmutable(arr, [1], arr1, [2]);
    });
    it('should work with nonexistent key', function () {
      const obj = immutable({});
      const obj1 = obj.setIn('a', 'b');
      shouldImmutable(obj, { }, obj1, { a: 'b' });

      const arr = immutable([]);
      const arr1 = arr.setIn(0, 1);
      shouldImmutable(arr, [], arr1, [1]);
    });
    it('should work with undefined value', function () {
      const obj = immutable({ a: 1 });
      const obj1 = obj.setIn('a', undefined);
      shouldImmutable(obj, { a: 1 }, obj1, { a: undefined });

      const arr = immutable([1]);
      const arr1 = arr.setIn(0, undefined);
      shouldImmutable(arr, [1], arr1, [undefined]);
    });
  });

  describe('object value', function () {
    it('should work with plain object value', function () {
      const obj = immutable({});
      const obj1 = obj.setIn('a', { b: 1 });
      shouldImmutable(obj, { }, obj1, { a: { b: 1 } });

      const arr = immutable([]);
      const arr1 = arr.setIn(0, { b: 1 });
      shouldImmutable(arr, [], arr1, [{ b: 1 }]);
    });
    it('should work with array value', function () {
      const obj = immutable({});
      const obj1 = obj.setIn('a', [1]);
      shouldImmutable(obj, { }, obj1, { a: [1] });

      const arr = immutable([]);
      const arr1 = arr.setIn(0, [1]);
      shouldImmutable(arr, [], arr1, [[1]]);
    });
    it('should work with immutable object value', function () {
      const obj = immutable({});
      const obj1 = obj.setIn('a', immutable({ b: 1 }));
      shouldImmutable(obj, { }, obj1, { a: { b: 1 } });

      const arr = immutable([]);
      const arr1 = arr.setIn(0, immutable({ b: 1 }));
      shouldImmutable(arr, [], arr1, [{ b: 1 }]);
    });
    it('should work with immutable array value', function () {
      const obj = immutable({});
      const obj1 = obj.setIn('a', immutable([1]));
      shouldImmutable(obj, { }, obj1, { a: [1] });

      const arr = immutable([]);
      const arr1 = arr.setIn(0, immutable([1]));
      shouldImmutable(arr, [], arr1, [[1]]);
    });
  });

  describe('callback', function () {
    it('should work with literal value return', function () {
      const obj = immutable({});
      const obj1 = obj.setIn('a', v => 1);
      shouldImmutable(obj, { }, obj1, { a: 1 });

      const arr = immutable([]);
      const arr1 = arr.setIn(0, v => 1);
      shouldImmutable(arr, [], arr1, [1]);
    });
    it('should set to undefined without return value', function () {
      const obj = immutable({});
      const obj1 = obj.setIn('a', (v) => {
      });
      shouldImmutable(obj, { }, obj1, { a: undefined });

      const arr = immutable([]);
      const arr1 = arr.setIn(0, (v) => {
      });
      shouldImmutable(arr, [], arr1, [undefined]);
    });
    it('should work with immutable object key', function () {
      const obj = immutable({ a: { b: 1 } });
      const obj1 = obj.setIn('a', v => v.set('b', 2));
      shouldImmutable(obj, { a: { b: 1 } }, obj1, { a: { b: 2 } });
      const obj2 = obj.setIn('a', (v) => {
        v.setIn('b', 2);
      });
      shouldImmutable(obj, { a: { b: 1 } }, obj2, { a: undefined });

      const arr = immutable([{ a: 1 }]);
      const arr1 = arr.setIn(0, v => v.set('a', 2));
      shouldImmutable(arr, [{ a: 1 }], arr1, [{ a: 2 }]);
      const arr2 = arr.setIn(0, (v) => {
        v.setIn('a', 2);
      });
      shouldImmutable(arr, [{ a: 1 }], arr2, [undefined]);
    });
  });
});

