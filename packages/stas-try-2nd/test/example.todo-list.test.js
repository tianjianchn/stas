
import assert from 'assert';
import 'promise-addition';
import Store, { createRouter } from '..';

describe('stas-try-2nd: todo list example', function () {
  it('should work', async function () {
    const store = new Store({
      tasks: [],
    });
    const Task = store.model('Task');
    const states = [store.state];

    store.subscribe((newState) => {
      states.push(newState);
    });

    const router = createRouter();
    router.all('/tasks/add', async (req, resp, next) => {
      const { text } = req.body;
      const task = await fetch('/tasks/add', { text });
      store.mutate((state) => {
        const id = Task.merge(task);
        return state.set('tasks', tasks => tasks.push(id));
      });
    });
    router.all('/tasks/toggle', async (req, resp, next) => {
      const { id } = req.body;
      await fetch('/tasks/toggle', { id });
      store.mutate((state) => {
        const task = Task.get(id);
        const mTask = task.set('completed', !task.completed);
        Task.set(mTask);
        return state;
      });
    });
    store.use(router);

    await store.dispatch('/tasks/add', { text: 'xxx' });
    assert.deepStrictEqual(store.state, { tasks: [1] });
    assert.deepStrictEqual(store.database, { Task: { 1: { id: 1, text: 'xxx', completed: false } } });
    assert.equal(states.length, 2);
    assert.notEqual(states[0], states[1]);

    await store.dispatch('/tasks/toggle', { id: 1 });
    assert.deepStrictEqual(store.state, { tasks: [1] });
    assert.deepStrictEqual(store.database, { Task: { 1: { id: 1, text: 'xxx', completed: true } } });
    assert.equal(states.length, 3);
    assert.strictEqual(states[1], states[2]);
  });
});

let seq = 0;
async function fetch(url, body) {
  await Promise.delay(100);
  if (url === '/tasks/add') {
    seq += 1;
    return { ...body, id: seq, completed: false };
  }
}
