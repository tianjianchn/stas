A state management with promise middleware, immutable data and model normalization
=================================

### Features
* Express-like and promise-based middlewares and routers, see [Middleware](#middleware) and [Router](#router)
* Immutable state and operations, see [Immutable State](#immutable-state)
* Normalize the data by model

### Example
`store.js` file:
```js
import { Store, Model } from 'stas';
import router from './router';

const User = new Model('User', {
  posts: 'Post',
});
const Post = new Model('Post', {
  author: 'User',
});

const store = new Store({ users: [] }, { models: [User, Post] });
store.use(router);

module.exports = store;
```

`router.js` file:
```js
import createRouter from 'uni-router';

const router = createRouter();

router.all('/users/query', async (req, resp, next) => {
  const { store } = req,
    { offset, limit } = req.body;

  const result = await fetch('/api/users/query', { offset, limit });

  store.mutate((newState) => {
    const ids = store.User.merge(result);
    newState.set('users', ids);
  });
});

router.all('/users/:userId/posts/create', async (req, resp, next) => {
  const { store } = req,
    { userId } = req.params,
    { title } = req.body;

  const result = await fetch(`/api/users/${userId}/posts/create`, { title });

  store.mutate((newState) => {
    const postId = store.Post.merge(result);
    const user = store.User.get(userId).set('posts', posts => posts.push(postId));
    store.User.set(userId, user);
  });
});

module.exports = router;

```

`UserListPage.js` file:
```js
import { PureComponent, PropTypes } from 'react';
import { connect } from 'react-stas';

class UserListPage extends PureComponent {
  static propTypes = {
    users: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object,
  }

  render() {
    const { users } = this.props;
    const { router } = this.context;
    return (<ul>
      {users.map(user => <li onClick={() => router.push(`/users/${user.id}`)}>
        <span>{user.name}</span>
      </li>)}
    </ul>);
  }
}

module.exports = connect(({ state, dispatch, props }) => ({ users: state.get('users').toJSON() }))(UserListPage);

```


`UserPostsPage.js` file:
```js
import { PureComponent, PropTypes } from 'react';
import { connect } from 'react-stas';

class UserPostsPage extends PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  onPressAddTask = () => {
    const { user, dispatch } = this.props;
    dispatch(`/users/${user.id}/posts/create`, { title: `New Post ${Date.now()}` });
  }

  render() {
    const { user } = this.props;
    const { posts } = user;
    return (<ul>
      <button onClick={this.onPressAddPost}>Add Post</button>
      {posts.map(post => <li>
        <span>{post.title}</span>
      </li>)}
    </ul>);
  }
}

module.exports = connect(({ state, dispatch, props, store }) => {
  const user = store.User.get(props.userId).toJSON();
  user.posts = user.posts.map(postId => store.Post.get(postId).toJSON());
  return { user };
})(UserPostsPage);

```

`index.js` file:
```js
import ReactDom from 'react-dom';
import { Provider } from 'react-stas';
import store from './store';
import UserListPage from './UserListPage';

ReactDom.render(
  <Provider store={store}>
    <UserListPage />
  </Provider>,
  document.getElementById('app'),
);

```

### Middleware

#### store.use((req, resp, next)=>{})

### Router
Like express router but with promise support. For detail see [uni-router](https://github.com/tianjianchn/midd/tree/master/packages/uni-router)

#### router.use(pattern?: string, middleare)
Prefix match `req.url` with pattern

#### router.all(pattern?: string, middleare)
Exact match `req.url` with pattern

### Immutable State
Use `List`, `Map` and `Model` to manipulate the state. For detail see [immutable-state](/packages/immutable-state).

#### store.mutate(callback)
Start a new mutation operation. 

#### .get(keysPath: array|string)
Get the value on the specific keys path. 

#### .set(keysPath: array|string, value: json|function)
Set the value on the specific keys path. If passed function, the function must return the result value.

#### .toJSON() or .toJS()
Convert to plain json object

#### .keys()
Return the keys

#### .length or .size
Return the keys length

#### .filter((value, key, this)=>bool)
Like `array.filter`

#### .find((value, key, this)=>bool)
Like `array.find`

#### .findKey((value, key, this)=>bool)
Like `array.findIndex`

#### .forEach((value, key, this)=>void)
Like `array.forEach`

#### .map((value, key, this)=>any)
Like `array.map`

#### .reduce((value, key, this)=>any, initialData)
Like `array.reduce`

#### .remove(keyPath) or .delete(keyPath)
Remove the leaf key

#### .merge(strategy?: bool|function, input)
Merge the value with specific strategy. 

#### .slice(start, end)
Like `array.slice`. `List` only.

#### .findIndex((value, index, this)=>bool)
Like `array.findIndex`. `List` only.

#### .push(value)
Like `array.push`. `List` only.

#### .pop()
Like `array.pop`. `List` only.

#### .unshift(value)
Like `array.unshift`. `List` only.

#### .shift()
Like `array.shift`. `List` only.

### Contributing
Checkout the [CONTRIBUTING.md](/CONTRIBUTING.md) if you want to help

### License
Licensed under MIT

Copyright (c) 2017 [Tian Jian](https://github.com/tianjianchn)
