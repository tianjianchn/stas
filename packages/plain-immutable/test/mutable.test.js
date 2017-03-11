
import assert from 'assert';
import Immutable from '..';

describe('plain-immutable: .mutable()', function () {
  it('should work', function () {
    const obj = Immutable({});
    const obj1 = obj.mutable();
    assert(Immutable.isImmutable(obj));
    assert(!Immutable.isImmutable(obj1));
    obj1.a = 1;
    assert.deepStrictEqual(obj1, { a: 1 });

    const arr = Immutable([]);
    const arr1 = arr.mutable();
    assert(Immutable.isImmutable(arr));
    assert(!Immutable.isImmutable(arr1));
    arr1[0] = 1;
    assert.deepStrictEqual(arr1, [1]);
  });
  it('should make only one level mutable', function () {
    const obj = Immutable({ a: { b: 1 } });
    const obj1 = obj.mutable();
    assert(Immutable.isImmutable(obj));
    assert(!Immutable.isImmutable(obj1));
    assert(Immutable.isImmutable(obj1.a));

    const arr = Immutable([[]]);
    const arr1 = arr.mutable();
    assert(Immutable.isImmutable(arr));
    assert(!Immutable.isImmutable(arr1));
    assert(Immutable.isImmutable(arr1[0]));
  });
  it('should be plain json after call .mutable()', function () {
    const arr = [],
      obj = {};
    assert(!arr.mutable);
    assert(!obj.mutable);

    const obj1 = Immutable({}).mutable();
    assert(!obj1.mutable);
    assert(!obj1.set);

    const arr1 = Immutable([]).mutable();
    assert(!arr1.mutable);
    assert(!obj1.set);
  });
});
