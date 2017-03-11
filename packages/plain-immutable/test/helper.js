
import assert from 'assert';
import immutable from '..';

export function shouldImmutable(prev, prevJSON, next, nextJSON, noChange) {
  assert.notEqual(prev, next);

  if (!noChange) {
    assert.notEqual(prevJSON, nextJSON);
    assert.notDeepStrictEqual(prev, next);
  }

  assert(isLooseImmutable(prev));
  assert(isLooseImmutable(next));

  assert.deepStrictEqual(prev, prevJSON);
  assert.deepStrictEqual(next, nextJSON);
}

function isLooseImmutable(val) {
  if (!val || typeof val !== 'object') return true;
  return immutable.isImmutable(val) && Object.isFrozen(val);
}

export function shouldThrow(cb, msg) {
  try {
    cb();
  } catch (e) {
    assert.equal(e.message, msg);
    return;
  }
  throw new Error(`Missing expected exception: ${msg}`);
}
