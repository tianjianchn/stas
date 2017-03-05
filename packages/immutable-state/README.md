An immutable state support List, Map and Model!
=================================

### Example
```js
import { Store, Model } from 'immutable-state';

const User = new Model('User');
const Post = new Model('Post', {
  user: 'User',
});

const store = new Store({ loginUserId: null }, { models: [User, Post] });

store.mutate((newState) => {
  const post = { id: 1, title: 'Hello', user: { id: 1, name: 'Tian' } };
  Post.merge(post);
  newState.set('loginUserId', 1);
});

console.log(store.state.toJSON());
// { loginUserId: 1, __models__: {
//   User: { 1: { id: 1, name: 'Tian' } },
//   Post: { id: { id: 1, title: 'Hello' } },
// } };

```

### Store

#### new Store(initialData, { models = [] })
Create a new store with initial json data. Data can be either an array([]) or a plain json object({}). You can also pass in the models, use the models to normalize your state data, see [Model](#model).

#### store.mutate(callback)
Start a new mutation operation. `callback` should use sync code, no promise or `async/await`. You should call all mutation methods in `callback` function, like `.set()`, `.merge()`. Other methods like `.get()` are not forced to be used in `callback` function. After callback end(return), if the state changed then set the new state.

#### store.state or store.getState()
Get current state of the store. State will be either a map or a list.

### Map
It is json object replacement in `immutable-state`. All plain json object({}) inserted to the store will be converted to a map. 

#### .get(keysPath: array|string)
Get the value on the specific keys path. 
```js
const store = new Store({ a: { b: { c: 1 } } });
store.state.get(['a', 'b', 'c']) === 1
```

#### .set(keysPath: array|string, value: json|function)
Set the value on the specific keys path. If passed function, the function must return the result value.
```js
const store = new Store({ a: { b: 1 } });
store.mutate((newState) => {
  newState.set(['a', 'b'], 1);
  newState.set('a', value => value.set('b', 2));
});
```

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

#### .remove(keysPath) or .delete(keysPath)
Remove the leaf key

#### .merge(strategy?: bool|function, input)
Merge the value with specific strategy. Strategy is used when conflict(same key with different values). If not specify strategy, it will overwrite the old value. If strategy equals to `true`, it will do deep merge. If strategy is a function, it will call that function with `(prev, next)=>any`

### List
It is array replacement in `immutable-state`. All plain array([]) inserted to the store will be converted to a list.
List has all methods that Map has with extras below.

#### .slice(start, end)
Like `array.slice`

#### .findIndex((value, index, this)=>bool)
Like `array.findIndex`

#### .push(value)
Like `array.push`

#### .pop()
Like `array.pop`

#### .unshift(value)
Like `array.unshift`

#### .shift()
Like `array.shift`

### Model
In the real world app, data are mostly consisted of nested objects. See a post with user and comments:
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
If we want to change the user's name, many locations need to change, which is terrible! So we use Model to flatten the structure, use id to keep the relationships. 
```js
import { Store, Model } from 'immutable-state';

const User = new Model('User');
const Post = new Model('Post', {
  author: 'User',
  comments: 'Comment',
});
const Comment = new Model('Comment', {
  creater: 'User',
});

const store = new Store({ post: null }, { models: [User, Post, Comment] });
store.mutate((newState) => {
  const id = Post.merge(post);
  newState.set('post', id);
});

console.log(store.state.toJSON());
// {
//   post: 1,
//   __models__: {
//     User: {
//       1: { id: 1, name: 'Tian' },
//       2: { id: 2, name: 'Jian' },
//     },
//     Post: {
//       1: { id: 1, title: 'Hello' },
//     },
//     Comment: {
//       1: { id: 1, text: 'Up', creater: 2 },
//       2: { id: 2, text: 'Thanks', creater: 1 },
//     },
//   },
// };

```

#### .merge(input: object|array)
Normalize the input data. Return the id or ids(if input is array).

#### .get(id)
Get the record

#### .mget(id1, id2, ...)
Get the records

#### .set(id, value: data|function)
Replace the record

#### .remove(id)
Remove the record

### License
Licensed under MIT

Copyright (c) 2017 [Tian Jian](https://github.com/tianjianchn)
