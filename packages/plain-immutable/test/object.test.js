
import assert from 'assert';
import immutable from '..';
import { IMMUTABLE_TAG } from '../dist/tag';
import { shouldThrow } from './helper';

describe('plain-immutable: object', function () {
  describe('constructor', function () {
    it('should create a immutable object', function () {
      const obj = { a: 1 };
      assert(!Object.isFrozen(obj));

      const obj1 = immutable(obj);
      assert.strictEqual(obj, obj1);
      assert.strictEqual(obj.a, 1);
      assert.strictEqual(Object.keys(obj).length, 1);
      assert(Object.isFrozen(obj));
    });
    it('should throw on a frozen object', function () {
      const obj = Object.freeze({ a: 1 });
      assert(Object.isFrozen(obj));
      shouldThrow(() => immutable(obj), `Cannot define property:${IMMUTABLE_TAG}, object is not extensible.`);
    });
    it('should throw when object with not configurable keys', function () {
      const arr = [1, 2];
      Object.defineProperty(arr, 'map', { configurable: false, value: 1 });
      assert.throws(() => immutable(arr), /Cannot redefine property: map/);
    });
    it('should make object deep immutable', function () {
      const obj = immutable({ a: { b: {} } });
      assert(immutable.isImmutable(obj));
      assert(immutable.isImmutable(obj.a));
      assert(immutable.isImmutable(obj.a.b));
      assert.deepStrictEqual(obj, { a: { b: {} } });
    });
    it('should be ok for circular-reference arrays', function () {
      const obj1 = { a: 1 },
        obj2 = { b: 2 };
      obj1.c = obj2;
      obj2.c = obj1;
      immutable(obj1);
      assert(immutable.isImmutable(obj1));
      assert(immutable.isImmutable(obj2));
    });
    it('should work with Object.create()', function () {
      const obj = immutable(Object.create(null));
      assert(immutable.isImmutable(obj));
      // assert.deepStrictEqual(obj, { });
    });
  });
});

