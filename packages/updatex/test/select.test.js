
import assert from 'assert';
import select, { state, checkOverSelect } from '../dist/select';
import immutable, { isReadOnly } from '../dist/readonly';
import { stringify } from '../dist/util';
import { shouldThrow } from './helper';

describe('updatex: select', function () {
  afterEach(function () {
    state.selectedPaths = {};
  });
  describe('input', function () {
    it('should throw when input is immutable', function () {
      const obj = immutable({ a: 1 });
      shouldThrow(() => select.call(obj), 'Only mutable object allowed in select()');

      const arr = immutable([1]);
      shouldThrow(() => select.call(arr), 'Only mutable object allowed in select()');

      assert.deepStrictEqual(state.selectedPaths, {});
    });
    it('should not clone when input is not immutable', function () {
      const obj = { a: 1 };
      const obj2 = select.call(obj);
      assert.strictEqual(obj, obj2);
      assert.deepStrictEqual(obj, { a: 1 });

      const arr = [1, 2];
      const arr2 = select.call(arr);
      assert.strictEqual(arr, arr2);
      assert.deepStrictEqual(arr, [1, 2]);

      assert.deepStrictEqual(state.selectedPaths, {});
    });
  });

  describe('key path', function () {
    it('should work with string path', function () {
      const obj = makeInput({ a: { b: { c: 1 } } });
      assert(!isReadOnly(obj));

      const obj1 = select.call(obj);
      assert.strictEqual(obj1, obj);

      const obj2 = select.call(obj, '');
      assert.strictEqual(obj2, obj);

      assert(isReadOnly(obj.a.b));
      const bb = select.call(obj, 'a.b');
      assert.strictEqual(bb, obj.a.b);
      assert(!isReadOnly(bb));
      assert.deepStrictEqual(bb, { c: 1 });

      assert.deepStrictEqual(state.selectedPaths, { 'a.b': ['a', 'b'] });
    });
    it('should work with array path', function () {
      const obj = makeInput({ a: { b: { c: 1 } } });

      const bb = select.call(obj, ['a', 'b']);
      assert.strictEqual(bb, obj.a.b);
      assert(!isReadOnly(bb));
      assert.deepStrictEqual(bb, { c: 1 });

      assert.deepStrictEqual(state.selectedPaths, { 'a.b': ['a', 'b'] });
    });
    it('should work with number path', function () {
      const arr = makeInput([{ a: 1 }]);

      const first = select.call(arr, 0);
      assert.strictEqual(first, arr[0]);
      assert(!isReadOnly(first));
      assert.deepStrictEqual(first, { a: 1 });

      assert.deepStrictEqual(state.selectedPaths, { 0: ['0'] });
    });
    it('should throw without string and array path', function () {
      const obj = makeInput({ a: { b: { c: 1 } } });
      [false, true, {}, new Date()].forEach(check);

      function check(path) {
        shouldThrow(() => select.call(obj, path), `Invalid key path: ${stringify(path)}, expect string or array`);
      }
    });
    it('should create object on non-existent node', function () {
      const obj = makeInput({ a: { b: 1 } });
      const cc = select.call(obj, 'a.c');
      assert.deepStrictEqual(cc, {});
      assert.deepStrictEqual(obj, { a: { b: 1, c: {} } });
    });
    it('should throw when there is non-object value on the path', function () {
      [1, undefined, null, false, true, '', '1'].forEach(check);
      function check(val) {
        const obj = makeInput({ a: val });
        shouldThrow(() => select.call(obj, 'a'), `Cannot select a non-object value at a: ${stringify(val)}`);
      }
    });
  });

  describe('selected path', function () {
    it('should not change anything when selecting sub path', function () {
      const obj = makeInput({ a: { b: { c: 1 } } });
      const bb = select.call(obj, 'a.b');
      assert.deepStrictEqual(state.selectedPaths, { 'a.b': ['a', 'b'] });

      const aa = select.call(obj, 'a');
      assert.deepStrictEqual(state.selectedPaths, { 'a.b': ['a', 'b'] });
      assert.strictEqual(aa.b, bb);

      const bb2 = select.call(obj, 'a.b');
      assert.deepStrictEqual(state.selectedPaths, { 'a.b': ['a', 'b'] });
      assert.strictEqual(bb2, bb);
    });
    it('should overwrite when selecting further path', function () {
      const obj = makeInput({ a: { b: { c: 1 } } });
      const aa = select.call(obj, 'a');
      assert.deepStrictEqual(state.selectedPaths, { a: ['a'] });

      const bb = select.call(obj, 'a.b');
      assert.deepStrictEqual(state.selectedPaths, { 'a.b': ['a', 'b'] });
      assert.strictEqual(aa.b, bb);
    });
  });

  describe('checkOverSelect()', function () {
    it('should not over select when value changed', function () {
      const original = immutable({ a: { b: { c: 1 } } });
      const cloned = { ...original };

      const bb = select.call(cloned, 'a.b');
      bb.c = 2;
      assert.deepStrictEqual(original, { a: { b: { c: 1 } } });
      assert.deepStrictEqual(state.selectedPaths, { 'a.b': ['a', 'b'] });
      shouldNotOverSelect(cloned, original);
      assert.deepStrictEqual(state.selectedPaths, { });
    });
    it('should over select when value is not changed', function () {
      const original = immutable({ a: { b: { c: 1 } } });
      const cloned = { ...original };

      select.call(cloned, 'a.b');
      shouldOverSelect(cloned, original, 'a.b');
    });
  });
});

function makeInput(input) {
  Object.keys(input).forEach((key) => {
    immutable(input[key]);
  });
  return input;
}

function shouldOverSelect(cloned, original, pathString) {
  const _warn = console.warn;
  let message;
  console.warn = (msg) => {
    message = msg;
  };

  checkOverSelect(cloned, original);
  console.warn = _warn;

  if (pathString) {
    assert.equal(message, `No value changed in path(${pathString}), you may over select path`);
  } else {
    assert(!message, 'Expect no over select');
  }
}

function shouldNotOverSelect(cloned, original) {
  shouldOverSelect(cloned, original);
}
