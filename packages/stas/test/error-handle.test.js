
const assert = require('assert');
const { createStore } = require('..');

describe('stas: error handle', function () {
  it('should catch the downstream error', function () {
    const store = createStore();

    let error;
    store.use((req, resp, next) => next().catch(e => (error = e)));

    store.use((req, resp, next) => Promise.reject(new Error('oh wrong')));

    return store.dispatch('/').catch(() => assert(false))
    .then(() => assert.equal(error.message, 'oh wrong'));
  });
  it('should throw with not-function in use()', function () {
    const store = createStore();
    store.use();
    assert.throws(() => store.use(1), /only accept function in use\(\)/);
  });
  it('should throw with empty url in dispatch', function () {
    const store = createStore();
    assert.throws(() => store.dispatch(), /require url/);
  });
});
