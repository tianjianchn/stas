
import assert from 'assert';
import immutable from '..';

describe('plain-immutable: static', function () {
  it('should throw with unsupported type', function () {
    assert.throws(() => immutable(new Date()), /Cannot make \[object Date\] immutable, only allow array and plain object/);
    assert.throws(() => immutable(new Buffer('')), /Cannot make \[object Uint8Array\] immutable, only allow array and plain object/);
    assert.throws(() => immutable(/a/), /Cannot make \[object RegExp\] immutable, only allow array and plain object/);
  });
  it('should return literal type directly', function () {
    assert.strictEqual(immutable(null), null);
    assert.strictEqual(immutable(undefined), undefined);
    assert.strictEqual(immutable(0), 0);
    assert.strictEqual(immutable(1), 1);
    assert.strictEqual(immutable(Number(1)), 1);
    assert.strictEqual(immutable(-1), -1);
    assert(isNaN(immutable(NaN)));
    assert.strictEqual(immutable(true), true);
    assert.strictEqual(immutable(false), false);
    assert.strictEqual(immutable(Boolean()), false);
    assert.strictEqual(immutable(''), '');
    assert.strictEqual(immutable('a'), 'a');
    assert.strictEqual(immutable(String('a')), 'a');
  });
  it('.isImmutable()', function () {
    assert(!immutable.isImmutable({}));
    assert(!immutable.isImmutable([]));
    assert(immutable.isImmutable(immutable([])));
    assert(immutable.isImmutable(immutable({})));

    assert(!immutable.isImmutable(1));
    assert(!immutable.isImmutable(false));
    assert(!immutable.isImmutable(null));
    assert(!immutable.isImmutable(undefined));
    assert(!immutable.isImmutable(''));
    assert(!immutable.isImmutable('a'));
  });
});

