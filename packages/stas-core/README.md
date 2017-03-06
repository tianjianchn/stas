State management with promise-based middleware
=================================

RECOMMEND: Use [stas](https://github.com/tianjianchn/stas) with immutable state and model support!

### Example
```js

// store.js
import Store from 'stas';
import router from './router';
const store = new Store({
  tasks: [],
});
store.use(router);

// router.js
import createRouter from 'uni-router';
const router = createRouter();

router.all('/tasks/add', async (req, resp, next) => {
  const { store } = req,
    { text } = req.body;
  const result = await fetch('/server/tasks/add', { text });
  const { id } = result;
  store.setState({ tasks: [...store.state.tasks, { id, text, completed: false }] });
});

router.all('/tasks/toggle', (req, resp, next) => {
  const { store } = req,
    { id } = req.body;
  const tasks = store.state.tasks;
  const index = tasks.findIndex(t => t.id === id);
  const completed = tasks[index].completed;
  store.setState({ tasks: [
    ...store.state.tasks.slice(0, index),
    { ...tasks[index], completed: !completed },
    ...store.state.tasks.slice(index + 1),
  ] });
});

// TodoListPage.js
import { PureComponent, PropTypes } from 'react';
import { connect } from 'react-stas';

class TodoListPage extends PureComponent {
  static propTypes = {
    tasks: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  }
  onPressAddTask = () => this.props.dispatch('/add-task', { text: `New Task ${Date.now()}` })
  onPressToggleTask = id => this.props.dispatch('/toggle-task', { id })
  render() {
    const { task } = this.props;
    return (<div>
      <button onClick={this.onPressAddTask}>Add Task</button>
      <ul>
        {tasks.map(task => <li>
          <input type="checkbox" value={task.completed} onClick={() => this.onPressToggleTask(task.id)} />
          <span>{task.text}</span>
        </li>)}
      </ul>
    </div>);
  }
}

connect(({ state, dispatch, props }) => ({ tasks: state.tasks }))(TodoListPage);

// index.js
import ReactDom from 'react-dom';
import { Provider } from 'react-stas';
import store from './store';
import TodoListPage from './TodoListPage';

ReactDom.render(
  <Provider store={store}><TodoListPage /></Provider>,
  document.getElementById('app'),
);

```

### Installation
```js
yarn add react-stas stas-core -S
```
or if your'd like to use npm:
```js
npm install react-stas stas-core -S
```

### Middleware

#### store.use((req, resp, next)=>{})

### Router
Like express router but with promise support. For detail see [uni-router](https://github.com/tianjianchn/midd/tree/master/packages/uni-router)

#### router.use(pattern?: string, middleare)
Prefix match `req.url` with pattern

#### router.all(pattern?: string, middleare)
Exact match `req.url` with pattern

### License
Licensed under MIT

Copyright (c) 2017 [Tian Jian](https://github.com/tianjianchn)
