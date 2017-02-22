A promise-based, middleware-driven and express-like state management
=================================

RECOMMEND: Use [stas-immutable](https://github.com/tianjianchn/stas) with immutable state support!

### Features
* Express-like and promise-based middlewares and routers, see [Middleware](#middleware) and [Router](#router)

### Example
`store.js` file:
```js
const router = reuqire('./router');
const {createStore} = require('stas');
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
  store.setState({tasks: [...store.state.tasks, {id, text, completed: false}]})
});
router.all('/toggle-task', (req, resp, next) => {
  const {store} = req, {id} = req.body;
  const index = store.state.tasks.findIndex(t => t.id === id);
  const completed = tasks[index].completed
  store.setState({tasks: [
    ...store.state.tasks.slice(0, index),
    {...tasks[index], completed: !completed}
    ...store.state.tasks.slice(index+1),
  ]})
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
  return {tasks: state.tasks}
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

### Middleware

#### store.use((req, resp, next)=>{})

### Router
See [uni-router](https://github.com/tianjianchn/midd/tree/master/packages/uni-router)

### License
Licensed under MIT

Copyright (c) 2017 [Tian Jian](https://github.com/tianjianchn)
