
const assert = require('assert');
const { createStore } = require('..');

describe('stas: middleware', function () {
  it('should work with zero middleware', function () {
    const state = { count: 0 };
    const store = createStore(state);
    const noChg = () => assert.equal(store.state, state) && assert.equal(store.state.count, 0);
    return store.dispatch('/').then(noChg)
      .then(() => store.dispatch('/a').then(noChg))
      .then(() => store.dispatch('/a/b').then(noChg));
  });
  it('should work with nothing-to-do middleware', function () {
    const state = { count: 0 };
    const store = createStore(state);
    store.use(() => {});
    const noChg = () => assert.equal(store.state, state) && assert.equal(store.state.count, 0);
    return store.dispatch('/').then(noChg)
      .then(() => store.dispatch('/a').then(noChg))
      .then(() => store.dispatch('/a/b').then(noChg));
  });
  it('should expose req properties', function (done) {
    const store = createStore();
    store.use((req, resp, next) => {
      assert.strictEqual(store, req.store);
      assert.deepStrictEqual({ a: 1 }, req.body);
      assert.strictEqual('/a', req.url);
      done();
    });
    store.dispatch('/a', { a: 1 });
  });
  it('should return things from dispatch', async function () {
    const store = createStore();
    store.use(async (req, resp, next) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 1;
    });
    const result = await store.dispatch('/');
    assert.equal(result, 1);
  });
});
