A state management with promise middleware, immutable data and model normalization
=================================

### Features
* Express-like and promise-based middlewares and routers. See [Middleware](#middleware) and [Router](#router)
* Immutable state and operations. See [Immutable State](#immutable-state)
* Model support to normalize data and operate like database. See [Model](#model)

### Example
```js
// store.js
import { Store, Model } from 'stas';
import router from './router';

const store = new Store({ users: [] });

store.model('User', { posts: ['Post'] });
store.model('Post', { author: 'User' });

store.use(router);

module.exports = store;

// router.js
import { createRouter } from 'stas';
const router = createRouter();

router.all('/users/query', async (req, store, next) => {
  const User = store.model('User');
  const { offset, limit } = req.body;

  const result = await fetch('/api/users/query', { offset, limit });

  store.mutate((state) => {
    const ids = User.merge(result);
    return state.set('users', ids);
  });
});

router.all('/users/:userId/posts/create', async (req, store, next) => {
  const User = store.model('User');
  const Post = store.model('Post');

  const { userId } = req.params,
    { title } = req.body;

  const result = await fetch(`/api/users/${userId}/posts/create`, { title });

  store.mutate((state) => {
    const postId = Post.merge(result);
    const mUser = User.get(userId).set('posts', posts => posts.push(postId));
    User.set(mUser);
    return state;
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
  const User = store.model('User');
  const Post = store.model('Post');

  const userIds = state.get('users');
  const users = User.get(userIds).map((user) => {
    user.posts = user.posts.map(postId => Post.get(postId));
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
yarn add stas react-stas -S
```
or if your'd like to use npm:
```js
npm install stas react-stas -S
```

### Middleware

#### store.use((req, store, next)=>{})

### Router
Like express router but with promise support. For detail see [uni-router](https://github.com/tianjianchn/midd/tree/master/packages/uni-router)

#### router.use(pattern?: string, middleare)
Prefix match `req.url` with pattern

#### router.all(pattern?: string, middleare)
Exact match `req.url` with pattern

### Immutable State
It's using [plain-immutable](/packages/plain-immutable) to make the state immutable. `plain-immutable` is a simple immutable library with array and plain object compatible. 
```js
import {immutable} from 'stas';

const arr = immutable([1, 2, { a: 'b' }]);
arr[0] = -1; // it will throw
arr[2].a = 'c'; // it will throw too even you want to change the nested object

console.log(arr[2].a);// b
console.log(JSON.stringify(arr));// [1,2,{"a":"b"}]

const mArr = arr.set(0, -1);
console.log(arr[0]);// 1
console.log(mArr[0]);// -1
```

### Model
Model is used to hold structured data and maintain their relationships. In short, it lets you operate like a database. In the real world app, data are mostly consisted of nested objects. See a post with user and comments:
```js
const post = {
  id: 1,
  title: 'Hello',
  author: {
    id: 1, name: 'Tian',
  },
  comments: [
    { id: 1, text: 'Up', creater: { id: 2, name: 'Jian' } },
    { id: 2, text: 'Thanks', creater: { id: 1, name: 'Tian' } },
  ],
};
```
If we want to change the user's name, many locations need to check and change, which is terrible! So we use models to flatten the structure, and use id to keep the records' relationships. 
```js
const store = new Store({ post: null });

store.model('User');
store.model('Post', { author: 'User', comments: ['Comment'] });
store.model('Comment', { creater: 'User' });

store.mutate((state) => {
  const Post = store.model('Post');
  const id = Post.merge(post);
  return state.set('post', id);
});

console.log(store.state); // {post: 1}
console.log(store.database);
// { Post: { '1': { id: 1, title: 'Hello', author: 1, comments: [Object] } },
//   User: { '1': { id: 1, name: 'Tian' }, '2': { id: 2, name: 'Jian' } },
//   Comment:
//    { '1': { id: 1, text: 'Up', creater: 2 },
//      '2': { id: 2, text: 'Thanks', creater: 1 } } }
```

#### .get(id)
Get the record(s). If you pass an array of ids, it will return an array of records. The return is always immutable.

#### .set(record)
Add or replace the record in database. 

#### .merge(input)
Normalize the input data and merge to database. Return the id or ids(if input is array).

#### .remove(id)
Remove the record(s)

### Hot Reload(HMR)
Since react-native doesn't support `module.hot.accept(path, callback)` but `module.hot.accept(callback)`, we have to use a function to export the store, then replace store's middlewares(routers) by utilizing closure.
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
