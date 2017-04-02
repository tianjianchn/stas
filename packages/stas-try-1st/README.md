A state management with promise middleware, immutable data and model normalization
=================================

**This is an early try of [stas](https://github.com/tianjianchn/stas)**

### Features
* Express-like and promise-based middlewares and routers, see [Middleware](#middleware) and [Router](#router)
* Immutable state and operations, see [Immutable State](#immutable-state)
* Normalize the data by model

### Example
```js
// store.js
import { Store, Model } from 'stas-try-1st';
import router from './router';

const models = [
  ['User', {
    posts: 'Post',
  }],
  ['Post', {
    author: 'User',
  }],
];

const store = new Store({ users: [] }, { models });
store.use(router);

module.exports = store;

// router.js
import createRouter from 'uni-router';
const router = createRouter();

router.all('/users/query', async (req, resp, next) => {
  const { store } = req,
    { User } = store.models,
    { offset, limit } = req.body;

  const result = await fetch('/api/users/query', { offset, limit });

  store.mutate((newState) => {
    const ids = User.merge(result);
    newState.set('users', ids);
  });
});

router.all('/users/:userId/posts/create', async (req, resp, next) => {
  const { store } = req,
    { User, Post } = store.models,
    { userId } = req.params,
    { title } = req.body;

  const result = await fetch(`/api/users/${userId}/posts/create`, { title });

  store.mutate((newState) => {
    const postId = Post.merge(result);
    const user = User.get(userId).set('posts', posts => posts.push(postId));
    store.User.set(userId, user);
  });
});

module.exports = router;

// UserListPage.js
import { PureComponent, PropTypes } from 'react';
import { connect } from 'react-stas';

class UserListPage extends PureComponent {
  static propTypes = {
    users: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  render() {
    const { users } = this.props;
    return (<ul>
      {users.map(user => <li>
        <span>{user.name}</span>
        <span>{user.posts.map(post => post.title).join(',')}</span>
      </li>)}
    </ul>);
  }
}

module.exports = connect(({ state, dispatch, props, store }) => {
  const { User, Post } = store.models;
  const userIds = state.get('users').toJSON();
  const users = User.mget(userIds).map((user) => {
    user = user.toJSON();
    user.posts = user.posts.map(postId => Post.get(postId).toJSON());
    return user;
  });
  return { users };
})(UserListPage);

// index.js
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

### Installation
```js
yarn add stas react-stas uni-router -S
```
or if your'd like to use npm:
```js
npm install stas react-stas uni-router -S
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

#### .filter()/.find()/.findKey()/.forEach()/.map()/.reduce()/
Like array corresponding methods, most with `(value, key, thisArg)=>{}` signature.

#### .remove(keyPath) or .delete(keyPath)
Remove the leaf key

#### .merge(strategy?: bool|function, input)
Merge the value with specific strategy. 

#### .slice()/.findIndex()/.push()/.pop()/.unshift()/.shift()
Like array corresponding methods. `List` only.

### Hot Reload(HMR)
Since react-native doesn't support module.hot.accept(path, callback) but module.hot.accept(callback), we have to use a function to export the store, then replace store's middlewares(routers) by utilizing closure.
```js
import Store from 'stas';
import routers from './routers';

export default function createStore() {
  const store = new Store()
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
