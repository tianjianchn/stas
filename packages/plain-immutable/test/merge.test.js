
// import assert from 'assert';
import immutable from '..';
import { shouldImmutable, shouldThrow } from './helper';
import { stringify } from '../dist/util';

describe('plain-immutable: .merge()', function () {
  describe('params', function () {
    it('should work with valid strategy and value', function () {
      [true, false, () => null].forEach((strategy) => {
        immutable({}).merge(strategy, {});
        immutable([]).merge(strategy, []);
      });
    });
    it('should throw with invalid strategy', function () {
      [1, '', '1', 'false'].forEach((strategy) => {
        const msg = `Invalid strategy: ${stringify(strategy)}, expect boolean or function`;
        const obj = immutable({});
        shouldThrow(() => obj.merge(strategy, {}), msg);
        const arr = immutable([]);
        shouldThrow(() => arr.merge(strategy, []), msg);
      });
    });
    it('should throw with invalid value', function () {
      [1, '', '1', 'false'].forEach((value) => {
        const msg = `Invalid value: ${stringify(value)}, expect array or object`;
        const obj = immutable({});
        shouldThrow(() => obj.merge(value), msg);
        const arr = immutable([]);
        shouldThrow(() => arr.merge(value), msg);
      });

      shouldThrow(() => immutable({}).merge([]), `Invalid value: ${stringify([])}, expect same type(array or object)`);
      shouldThrow(() => immutable([]).merge({}), `Invalid value: ${stringify({})}, expect same type(array or object)`);
    });
  });

  describe('normal strategy', function () {
    it('should overwrite literal values', function () {
      const obj = immutable({ a: 't', b: 1 });
      const obj1 = obj.merge({ a: 'j' });
      shouldImmutable(obj, { a: 't', b: 1 }, obj1, { a: 'j', b: 1 });

      const arr = immutable([1, 2]);
      const arr1 = arr.merge([-1]);
      shouldImmutable(arr, [1, 2], arr1, [-1, 2]);
      const arr2 = arr.merge([-1, -2, -3]);
      shouldImmutable(arr, [1, 2], arr2, [-1, -2, -3]);
    });
    it('should overwrite object values', function () {
      const obj = immutable({ a: [1, 2] });
      const obj1 = obj.merge({ a: [-1] });
      shouldImmutable(obj, { a: [1, 2] }, obj1, { a: [-1] });

      const arr = immutable([{ a: 1, b: 2 }]);
      const arr1 = arr.merge([{ a: -1 }]);
      shouldImmutable(arr, [{ a: 1, b: 2 }], arr1, [{ a: -1 }]);
    });
    it('should work with passing strategy=fasle explicitly', function () {
      const obj = immutable({ a: 't', b: 1 });
      const obj1 = obj.merge(false, { a: 'j' });
      shouldImmutable(obj, { a: 't', b: 1 }, obj1, { a: 'j', b: 1 });

      const arr = immutable([1, 2]);
      const arr1 = arr.merge(false, [-1]);
      shouldImmutable(arr, [1, 2], arr1, [-1, 2]);
    });
  });

  describe('deep strategy', function () {
    it('should overwrite the values deeply', function () {
      const obj = immutable({ a: [1, 2] });
      const obj1 = obj.merge(true, { a: [-1] });
      shouldImmutable(obj, { a: [1, 2] }, obj1, { a: [-1, 2] });

      const arr = immutable([{ a: 1, b: 2 }]);
      const arr1 = arr.merge(true, [{ a: -1 }]);
      shouldImmutable(arr, [{ a: 1, b: 2 }], arr1, [{ a: -1, b: 2 }]);
    });
    it('should fallback to normal strategy without same object type', function () {
      const obj = immutable({ a: [1, 2] });
      const obj1 = obj.merge(true, { a: { b: 1 } });
      shouldImmutable(obj, { a: [1, 2] }, obj1, { a: { b: 1 } });

      const arr = immutable([{ a: 1, b: 2 }]);
      const arr1 = arr.merge(true, [1]);
      shouldImmutable(arr, [{ a: 1, b: 2 }], arr1, [1]);
    });
  });

  describe('function strategy', function () {
    it('should overwrite using the function', function () {
      const obj = immutable({ a: 1 });
      const obj1 = obj.merge((prev, next, key) => prev + next, { a: 2 });
      shouldImmutable(obj, { a: 1 }, obj1, { a: 3 });
    });
  });
});

