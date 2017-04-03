Update plain object with immutability
=================================

### Example
```js
import updatex from 'updatex';

const obj = { a: {b: 1}, c: 'hello'}

const obj2 = updatex(obj, (newObj)=>{
  const a = newObj.select('a');
  a.b = 2;
  console.log(a.b); // 2
})

updatex(obj, (newObj)=>{
  newObj.setIn('a.b', 2);
  console.log(newObj.a.b); // 2
})

console.log(obj2 !== obj); // true
```

### License
Licensed under MIT

Copyright (c) 2017 [Tian Jian](https://github.com/tianjianchn)
