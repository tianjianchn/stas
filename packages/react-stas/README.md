stas state management for react
=================================

### Example
`TodoListPage.js` file:
```js
import { PureComponent, PropTypes } from 'react';
import { connect } from 'react-stas';

class TodoListPage extends PureComponent {
  static propTypes = {
    tasks: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  onPressAddTask = () => this.props.dispatch('/tasks/add', { text: `New Task ${Date.now()}` })

  onPressToggleTask = id => this.props.dispatch('/tasks/toggle', { id })
  
  render() {
    const { tasks } = this.props;
    return (
      <button onClick={this.onPressAddTask}>Add Task</button>
      <ul>
        {tasks.map(task=><li>
          <input type='checkbox' value={task.completed} onClick={()=>this.onPressToggleTask(task.id)}/>
          <span>{task.text}</span>
        </li>)}
      </ul>
    )
  }
}

module.exports = connect(({state, dispatch, props})=>{
  return {tasks: state.get('tasks').toJSON()}
})(TodoListPage)
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

### License
Licensed under MIT

Copyright (c) 2017 [Tian Jian](https://github.com/tianjianchn)
