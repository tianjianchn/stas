
import assert from 'assert';
import immutable from '..';
import { IMMUTABLE_TAG } from '../dist/tag';
import { shouldThrow, shouldImmutable } from './helper';

describe('plain-immutable: array', function () {
  describe('constructor', function () {
    it('should create a immutable array', function () {
      const arr = [1, 2];
      assert(!Object.isFrozen(arr));

      const arr1 = immutable(arr);
      assert.strictEqual(arr, arr1);
      assert.strictEqual(arr[0], 1);
      assert.strictEqual(arr.length, 2);
      assert(Object.isFrozen(arr));
    });
    it('should throw on a frozen array', function () {
      const arr = Object.freeze([1, 2]);
      assert(Object.isFrozen(arr));
      shouldThrow(() => immutable(arr), `Cannot define property:${IMMUTABLE_TAG}, object is not extensible.`);
    });
    it('should throw with not-configurable keys', function () {
      const arr = [1, 2];
      Object.defineProperty(arr, 'map', { configurable: false, value: 1 });
      assert.throws(() => immutable(arr), /Cannot redefine property: map/);
    });
    it('should make array deep immutable', function () {
      const arr = immutable([[[]]]);
      assert(immutable.isImmutable(arr));
      assert(immutable.isImmutable(arr[0]));
      assert(immutable.isImmutable(arr[0][0]));
      assert.deepStrictEqual(arr, [[[]]]);
    });
    it('should be ok for circular-reference arrays', function () {
      const arr1 = [1],
        arr2 = [2];
      arr1.push(arr2);
      arr2.push(arr1);
      immutable(arr1);
      assert(immutable.isImmutable(arr1));
      assert(immutable.isImmutable(arr2));
    });
    it('should not break common use cases of array', function () {
      const arr = immutable([1, 'a', [3]]);
      assert.deepStrictEqual(arr, [1, 'a', [3]]);
      assert.strictEqual(arr.length, 3);

      const result1 = [];
      for (const ii in arr) result1.push([ii, arr[ii]]);
      assert.deepStrictEqual(result1, [['0', 1], ['1', 'a'], ['2', [3]]]);

      const result2 = [];
      for (const vv of arr) result2.push(vv);
      assert.deepStrictEqual(result2, [1, 'a', [3]]);

      assert.deepStrictEqual(Object.keys(arr), ['0', '1', '2']);
      assert.deepStrictEqual(JSON.stringify(arr), '[1,"a",[3]]');
    });
  });

  describe('ban features', function () {
    it('should throw when assigning new key or value', function () {
      const arr = [-1];
      arr[0] = -2;
      arr[1] = -1;
      delete arr[1];
      Object.defineProperty(arr, 0, { value: -1 });
      arr.splice(0, 1, -2, -3);
      assert.deepStrictEqual(arr, [-2, -3]);

      immutable(arr);
      assert.throws(() => (arr[0] = 1), /Cannot assign to read only property '0' of object '\[object Array\]'/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => (arr[3] = 1), /Can't add property 3, object is not extensible/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => delete arr[0], /Cannot delete property '0' of \[object Array\]/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => Object.defineProperty(arr, 0, { value: 1 }), /Cannot redefine property: 0/);
    });
    it('should throw when changing the prototype of immutable array', function () {
      const proto = Object.create(Array.prototype, { a: { value: 1 } });
      const arr = [-1];
      Object.setPrototypeOf(arr, proto);
      assert.deepStrictEqual(arr.a, 1);

      const arr1 = immutable([-1]);
      assert.throws(() => Object.setPrototypeOf(arr1, proto), /\[object Array\] is not extensible/);
      assert.throws(() => (arr1.__proto__ = proto), /\[object Array\] is not extensible/);
    });
    it.skip('should throw when calling mutation methods', function () {
      const arr = immutable([-2, -3]);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => arr.splice(0, 1), /Cannot add\/remove sealed array elements/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => arr.splice(0, 1, 2), /Cannot modify frozen array elements/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => arr.push(0), /Can't add property 3, object is not extensible/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => arr.pop(), /Cannot assign to read only property 'length' of object '\[object Array\]'/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => arr.shift(0), /Cannot add\/remove sealed array elements/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => arr.unshift(), /Cannot assign to read only property 'length' of object '\[object Array\]'/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => arr.sort(), /Cannot assign to read only property '1' of object '\[object Array\]'/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => arr.reverse(), /Can't add property 2, object is not extensible/);
      assert.deepStrictEqual(arr, [-2, -3]);
      assert.throws(() => arr.fill(1), /Cannot modify frozen array elements/);
      assert.deepStrictEqual(arr, [-2, -3]);
    });
  });

  describe('replaced methods', function () {
    it('should return immutable value for non-mutation methods', function () {
      const arr = immutable([1, 2, 3]);
      assert.deepStrictEqual(arr[0], 1);

      check(arr.map(v => v + 1), [2, 3, 4]);
      check(arr.filter(v => v > 1), [2, 3]);
      check(arr.slice(1), [2, 3]);
      check(arr.concat(4, 5), [1, 2, 3, 4, 5]);
      check(arr.reduce((p, v) => p + v, 0), 6);
      check(arr.reduceRight((p, v) => p + v), 6);

      check(arr.indexOf(2), 1);
      check(arr.lastIndexOf(2), 1);
      check(arr.findIndex(v => v === 2), 1);

      function check(result, json) {
        shouldImmutable(result, json, arr, [1, 2, 3]);
      }
    });
    it('should return immutable value for mutation methods', function () {
      const arr = immutable([1, 2, 3]);
      check(arr.push(4), [1, 2, 3, 4]);
      check(arr.pop(), [1, 2]);
      check(arr.shift(), [2, 3]);
      check(arr.unshift(0), [0, 1, 2, 3]);
      check(arr.fill(0), [0, 0, 0]);
      check(arr.splice(0, 1, -1), [-1, 2, 3]);
      check(arr.reverse(), [3, 2, 1]);
      check(arr.sort(), [1, 2, 3], true);
      check(arr.copyWithin(1, 0, 2), [1, 1, 2]);

      function check(result, json, noChange) {
        shouldImmutable(result, json, arr, [1, 2, 3], noChange);
      }
    });
  });
});

// function isImmutableAndEqualTo(obj, json) {
//   if (a && typeof a === 'object') {
//     assert(immutable.isImmutable(a));
//   }
//   assert(Object.isFrozen(a));
//   assert.deepStrictEqual(a, b);
// }

