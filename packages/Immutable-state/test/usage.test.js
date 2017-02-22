
const assert = require('assert');
// const { inspect } = require('util');
const { createStore } = require('..');

describe('immutable-state: usage', function () {
  it('should work with tasks example', function () {
    const store = createStore({
      tasks: [],
      filter: 'all', //visibility filter, all/active
    });
    const state1 = store.getState(),
      json1 = state1.toJSON();

    // add task
    store.mutate((newState) => {
      newState.set('tasks', tasks => tasks.set(0, { id: 1, text: 'xxx', completed: false }));
      // console.log(inspect(newState._data, { depth: null }));
    });
    const state2 = store.getState(),
      json2 = state2.toJSON();
    assert.notEqual(state1, state2);
    assert.notEqual(json1, json2);
    assert.deepStrictEqual(json2, { tasks: [{ id: 1, text: 'xxx', completed: false }], filter: 'all' });

    // complete the task
    store.mutate((newState) => {
      newState.set(['tasks', 0, 'completed'], true);
    });
    const state3 = store.getState(),
      json3 = state3.toJSON();
    assert.notEqual(state2, state3);
    assert.notEqual(json2, json3);
    assert.deepStrictEqual(json3, { tasks: [{ id: 1, text: 'xxx', completed: true }], filter: 'all' });

    // show ongoing tasks only
    store.mutate((newState) => {
      newState.set('filter', 'active');
    });
    const state4 = store.getState(),
      json4 = state4.toJSON();
    assert.notEqual(state3, state4);
    assert.notEqual(json3, json4);
    assert.deepStrictEqual(json4, { tasks: [{ id: 1, text: 'xxx', completed: true }], filter: 'active' });
  });
});

