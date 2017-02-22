An immutable state
=================================

### Example
```js
const router = reuqire('./router');
const {createStore} = require('immutable-state');
const store = createStore({
  tasks: [],
});

store.mutate((newState) => {
  newState.set('tasks', tasks => tasks.push({id, text, completed: false}));
});
console.log(store.state);

store.mutate((newState) => {
  newState.set('tasks', (tasks) => {
    const index = tasks.findIndex(t => t.id === id);
    const completed = tasks.get([index, 'completed']);
    tasks = tasks.set([index, 'completed'], !completed);
    return tasks;
  });
});
console.log(store.state);
```
### API

#### createStore(initialState)

#### store.mutate(callback)
Start a new mutation operation. You should call all mutation methods in `callback` function. `callback` should use sync code, no promise or `async/await`.

#### .get(keysPath)

#### .set(keysPath)

### License
Licensed under MIT

Copyright (c) 2017 [Tian Jian](https://github.com/tianjianchn)
