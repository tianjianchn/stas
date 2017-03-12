
import assert from 'assert';
import immutable, { isImmutable } from '..';

describe('plain-immutable: static', function () {
  it('should throw with unsupported type', function () {
    [new Date(), new Buffer(''), /a/, { $$typeof: 0xeac7 }].forEach((value) => {
      immutable(value);
      assert(!isImmutable(value));
    });
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

