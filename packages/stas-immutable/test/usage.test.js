
const assert = require('assert');
// const { inspect } = require('util');
const { createStore } = require('..');

describe('stas-immutable: usage', function () {
  it('should work with tasks example', async function () {
    const store = createStore({
      tasks: [],
    });
    const states = [store.getState()];

    store.subscribe((newState) => {
      states.push(newState);
    });

    store.use((req, resp, next) => {
      if (req.url === '/add-task') {
        store.mutate((newState) => {
          newState.set('tasks', tasks => tasks.push(req.body.task));
        });
      } else if (req.url === '/toggle-task') {
        const id = req.body.id;
        store.mutate((newState) => {
          newState.set('tasks', (tasks) => {
            const index = tasks.findIndex(t => t.id === id);
            const completed = tasks.get([index, 'completed']);
            tasks = tasks.set([index, 'completed'], !completed);
            return tasks;
          });
        });
      }
    });

    await store.dispatch('/add-task', { task: { id: 1, text: 'xxx', completed: false } });
    assert.deepStrictEqual(store.state.toJSON(), { tasks: [{ id: 1, text: 'xxx', completed: false }] });

    store.dispatch('/add-task', { task: { id: 2, text: 'yyy', completed: false } });
    assert.deepStrictEqual(store.state.toJSON(), { tasks: [{ id: 1, text: 'xxx', completed: false }, { id: 2, text: 'yyy', completed: false }] });

    store.dispatch('/toggle-task', { id: 2 });
    assert.deepStrictEqual(store.state.toJSON(), { tasks: [{ id: 1, text: 'xxx', completed: false }, { id: 2, text: 'yyy', completed: true }] });

    assert.deepStrictEqual(states.length, 4);
    const [state1, state2, state3, state4] = states;

    assert.notEqual(state1, state2);
    assert.notEqual(state1, state3);
    assert.notEqual(state1, state4);
    assert.notEqual(state2, state3);
    assert.notEqual(state2, state4);
    assert.notEqual(state3, state4);

    assert.notEqual(state1.toJSON(), state2.toJSON());
    assert.notEqual(state1.toJSON(), state3.toJSON());
    assert.notEqual(state1.toJSON(), state4.toJSON());
    assert.notEqual(state2.toJSON(), state3.toJSON());
    assert.notEqual(state2.toJSON(), state4.toJSON());
    assert.notEqual(state3.toJSON(), state4.toJSON());
  });
});

