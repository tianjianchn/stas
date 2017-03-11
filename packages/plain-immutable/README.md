Make plain json data(array and object) immutable
=================================

It's using `Object.freeze()` and `Object.defineProperty()` to achieve immutability. See compatible on [compat-table](https://kangax.github.io/compat-table/es5/)(shortly IE9+).  
Should only work for json data, not function, date and other user-defined/third-party-defined object. In short, it could be the replacement of `array([])` and `plain object({})`.

### Example
```js
import immutable from 'plain-immutable';

const arr = immutable([1, 2, { a: 'b' }]);
arr[0] = -1; // it will throw
arr[2].a = 'c'; // it will throw too even you want to change the nested object

console.log(arr[2].a);// b
console.log(JSON.stringify(arr));// [1,2,{"a":"b"}]

const newArr = arr.set(0, -1);
console.log(arr[0]);// 1
console.log(newArr[0]);// -1
```

### Static Methods
#### immutable(value)
*Alias immutable.fromJSON(), immutable.fromJS()*  
Make the value immutable, only for array and plain object. If you pass a literal value(string, number or boolean), It will do nothing and return itself. Other types will be thrown an error. The value will be deeply made immutable on itself, no clone and copy.
```js
const arr = [{ a: 1 }];
const arr1 = immutable(arr);
console.log(arr === arr1);// true
```

#### immutable.isImmutable(value: any)
True if the value is an immutable array or object.
```js
console.log(immutable.isImmutable(1)); // false
console.log(immutable.isImmutable(true)); // false
console.log(immutable.isImmutable('a')); // false
console.log(immutable.isImmutable({})); // false
console.log(immutable.isImmutable([])); // false
console.log(immutable.isImmutable(Object.create(null))); // false
console.log(immutable.isImmutable(immutable({}))); // true
console.log(immutable.isImmutable(immutable([]))); // true
console.log(immutable.isImmutable(immutable(Object.create(null)))); // true
```

### Additional Instace Methods
These methods are applied to both immutable object and immutable array. So make sure that your object don't have these properties.

#### .set(key: string, value: json|function)
Same like `.setIn(key, value)`, but only allow string type key

#### .setIn(keyPath: string|array, value: json|function)
Return a new immutable copy having set the value at leaf key of key path. If any key in the path is not existent, create a plain object at that key. You can pass a function(setter) which will be used to generate new value at the leaf key.
```js
const obj = immutable({ a: 1, nums: [] });
const obj1 = obj.set('a', 2); // {a: 2, nums: []}
const obj2 = obj.setIn(['nums'], nums => nums.push(1)); // {a: 1, nums: [1]}
```

#### .remove(key: string)
*Alias .delete()*  
Same like `.removeIn(key)`, but only allow string type key

#### .removeIn(keyPath: string|array)
*Alias .deleteIn()*  
Return a new immutable copy having removed the value at leaf key of key path. If any key in the path is not existent, nothing will be changed.
```js
const obj = immutable({ a: 1, nums: [1] });
const obj1 = obj.remove('a'); // {nums: [1]}
const obj2 = obj.removeIn(['nums', 0]); // {a: 1, nums: []}
```

#### .merge(strategy?: boolean|function, value: json)
Return a new immutable copy having merged with the value by the strategy. Strategy is used to deal conflicts(same key but different values). There are three types of strategy:  
* false(or not specified): Old value will be overwriten
* true: Deeply merge if the two values are with same type(array or object)
* function: Called a merger with `(prev, next, key)=>any`. It will be invoked on each conflicted key.
```js
const arr = immutable([1, { a: 2, b: 3 }]);
console.log(arr.merge([-1, { c: 4 }])); // [-1, {c: 4}]
console.log(arr.merge(true, [-1, { c: 4 }])); // [-1, {a: 2, b: 3, c: 4}]

console.log(immutable([1, 2]).merge((p, n) => p + n, [2, 3])); // [3, 5]
```

#### .mutable()
*Alias .asMutable()*  
Return a mutable copy. That is to say the return value is normal plain object or array. You can use `=`(assign operator) to set new key or value, and all methods will be restored to original behavior(like `arr.push()` will return new length other than new immutable array).  
You should know that `.mutable()` will not make nested object(array) mutable.
```js
const arr = immutable([1, 2, 3]);
const arr1 = arr.mutable();
arr1[0] = -1;
console.log(arr1); // [-1, 2, 3]
```

### Array
Since array has a lot of methods like `push` and `slice`. Some are mutation operations while some are not.  
For non-mutation methods that doesn't surely return literal value like `slice`, they are replaced to return immutable value. These methods are `slice`, `concat`, `map`, `reduce`, `reduceRight`, `filter`.  
For mutation methods like `push`, they are replaced to return a new immutable copy other than their orignal returns. These methods are `push`, `pop`, `shift`, `unshift`, `fill`, `sort`, `splice`, `reverse`, `copyWithin`.  
If any of these methods doesn't exist, no replacement for that method exists too.
```js
const arr = immutable([1, 2, 3]);
const newArr = arr.push(4); // [1, 2, 3, 4]
```

### License
Licensed under MIT

Copyright (c) 2017 [Tian Jian](https://github.com/tianjianchn)
