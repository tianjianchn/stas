A promise-based, middleware-driven, express-like and immutable built-in state management
=================================

### Features
* Immutable state and operations, see [Immutable State](#immutable-state)
* Express-like and promise-based middlewares and routers, see [Middleware](#middleware) and [Router](#router)

### Example
`store.js` file:
```js
import router from './router';
import { createStore } from 'stas-immutable';

const store = createStore({
  tasks: [],
});
export default store;

store.use(router);
```

`router.js` file:
```js
import createRouter from 'uni-router';

const router = createRouter();
export default router;

router.all('/add-task', async (req, resp, next) => {
  const { store } = req,
    { text } = req.body;
  const result = await fetch('/server/add-task', { text });
  const { id } = result;
  store.mutate((newState) => {
    newState.set('tasks', tasks => tasks.push({ id, text, completed: false }));
  });
});
router.all('/toggle-task', (req, resp, next) => {
  const { store } = req,
    { id } = req.body;
  store.mutate((newState) => {
    newState.set('tasks', (tasks) => {
      const index = tasks.findIndex(t => t.id === id);
      const completed = tasks.get([index, 'completed']);
      tasks = tasks.set([index, 'completed'], !completed);
      return tasks;
    });
  });
});
```

`TodoListPage.js` file:
```js
import { PureComponent, PropTypes } from 'react';
import { connect } from 'react-stas';

class TodoListPage extends PureComponent {
  static propTypes = {
    tasks: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  onPressAddTask = () => this.props.dispatch('/add-task', { text: `Current Time: ${Date.now()}` })

  onPressToggleTask = id => this.props.dispatch('/toggle-task', { id })

  render() {
    return (<div>
      <button onClick={this.onPressAddTask}>Add Task</button>
      <ul>
        {this.props.tasks.map((task, index) => <li key={index}>
          <input type="checkbox" value={task.completed} onClick={() => this.onPressToggleTask(task.id)} />
          <span>{task.get('text')}</span>
        </li>)}
      </ul>
    </div>);
  }
}

export default connect(({state, dispatch, props}) => {
  return { tasks: state.get('tasks').toJSON() }
})(TodoListPage);
```

`index.js` file:
```js
import ReactDom from 'react-dom';
import { Provider } from 'react-stas';
import store from './store';
import TodoListPage from './TodoListPage';

ReactDom.render(
  <Provider store={store}><TodoListPage /></Provider>,
  document.getElementById('app'),
);
```

### Immutable State
State is immutable by using [immutable-state](/packages/immutable-state)(most operations are like [immutable-js](https://github.com/facebook/immutable-js/)). 
Mutation methods(like `.set()`, `.remove()`) must be used in `store.mutate()`, while others(like `.get()`, `.filter()`) are not.

#### store.mutate(callback)
Start a new mutation operation. You should call all mutation methods in `callback` function. `callback` should use sync code, no promise or `async/await`.

#### .get(keysPath)

#### .set(keysPath, value), .set(keysPath, callback)

#### .remove(key)

#### .keys()

#### .findIndex()/.find()/.findKey()

#### .forEach()/.map()/.filter()/.slice()/.reduce()

#### .push()/.pop()/.shift()/.unshift()

### Middleware

#### store.use((req, resp, next)=>{})

### Router
See [uni-router](https://github.com/tianjianchn/midd/tree/master/packages/uni-router)

### Hot Reload(HMR)
Since react-native doesn't support `module.hot.accept(path, callback)` but `module.hot.accept(callback)`, we have to use a function to export the store, then replace store's middlewares(routers) by utilizing closure.

```js
import { createStore } from 'stas-immutable';
import routers from './routers';

export default function configureStore() {
  const store = createStore()
  store.use(routers);

  if (module.hot) {
    module.hot.accept(() => {
      const newRouters = require('./routers').default;
      store.clearMiddlewares();
      store.use(newRouters);
    });
  }
  return store;
}
```

### Contributing
Checkout the [CONTRIBUTING.md](/CONTRIBUTING.md) if you want to help

### License
Licensed under MIT

Copyright (c) 2017 [Tian Jian](https://github.com/tianjianchn)
