A promise-based, middleware-driven, express-like and immutable built-in state management
=================================

### Features
* Immutable state and operations, see [Immutable State](#immutable-state)
* Express-like and promise-based middlewares and routers, see [Middleware](#middleware) and [Router](#router)

### Example
`store.js` file:
```js
const router = reuqire('./router');
const {createStore} = require('stas-immutable');
const store = createStore({
  tasks: [],
});
store.use(router)
```

`router.js` file:
```js
const Router = require('uni-router');
const router = Router();
router.all('/add-task', async (req, resp, next) => {
  const {store} = req, {text} = req.body;
  const result = await fetch('/server/add-task', {text})
  const {id} = result;
  store.mutate((newState) => {
    newState.set('tasks', tasks => tasks.push({id, text, completed: false}));
  });
});
router.all('/toggle-task', (req, resp, next) => {
  const {store} = req, {id} = req.body;
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
const {PureComponent, PropTypes} = require('react');
const {connect} = require('react-stas');

class TodoListPage extends PureComponent{
  static propTypes = {
    tasks: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  }
  onPressAddTask = ()=>{
    return dispatch('/add-task', {text: `Remove the password: ${Math.random()}`})
  }
  onPressToggleTask = (id)=>{
    return dispatch('/toggle-task', {id})
  }
  render(){
    return (
      <button onClick={this.onPressAddTask}>Add Task</button>
      <ul>
        {this.props.tasks.map(task=><li>
          <input type='checkbox' value={task.completed} onClick={()=>this.onPressToggleTask(task.id)}/>
          <span>{task.get('text')}</span>
        </li>)}
      </ul>
    )
  }
}

connect((state, dispatch)=>{
  return {tasks: state.get('tasks').toJSON()}
})(TodoListPage)
```

`index.js` file:
```js
const ReactDom = require('react-dom');
const {Provider} = require('react-stas')
const store = require('./store');
const TodoListPage = require('./TodoListPage');

ReactDom.render(
  <Provider store={store}><TodoListPage /></Provider>,
  document.getElementById('app')
);
```

### Immutable State
State is immutable by using [immutable-state](/packages/immutable-state). Most operations are like [immutable-js](https://github.com/facebook/immutable-js/). 
You must use mutation methods(like `.set()`, `.remove()`) in `store.mutate()`, while others(like `.get()`, `.filter()`) are not.

#### store.mutate(callback)
Start a new mutation operation. You should call all mutation methods in `callback` function. `callback` should use sync code, no promise or `async/await`.

#### .get(keysPath)

#### .set(keysPath)

### Middleware

#### store.use((req, resp, next)=>{})

### Router
See [uni-router](https://github.com/tianjianchn/midd/tree/master/packages/uni-router)

### Contributing
Checkout the [CONTRIBUTING.md](/CONTRIBUTING.md) if you want to help

### License
Licensed under MIT

Copyright (c) 2017 [Tian Jian](https://github.com/tianjianchn)
