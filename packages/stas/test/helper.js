
import assert from 'assert';
import { isImmutable } from 'plain-immutable';
import Store from '..';

export function shouldImmutable(cb, { stateChanged = true, databaseChanged = true, state, database } = {}) {
  const store = new Store(state, { database });
  const timeline = [{ state: store.state, database: store.database }];
  assert(isLooseImmutable(store.state));
  assert.deepStrictEqual(store.state, state);
  assert.deepStrictEqual(store.database, database || {});

  store.subscribe((newState) => {
    assert.equal(newState, store.state);
    timeline.push({ state: newState, database: store.database });
  });

  if (cb.length === 2) {
    cb(store, done);
  } else {
    cb(store);
    done();
  }

  function done() {
    assert(isLooseImmutable(store.state));

    const changed = stateChanged || databaseChanged;
    assert.equal(timeline.length, changed ? 2 : 1);

    if (stateChanged) {
      assert.notEqual(timeline[0].state, timeline[1].state);
    } else {
      assert.deepStrictEqual(store.state, state);
    }
  }
}

function isLooseImmutable(val) {
  if (!val || typeof val !== 'object') return true;
  return isImmutable(val) && Object.isFrozen(val);
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
