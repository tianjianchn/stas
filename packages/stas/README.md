State management with models, immutable data and promise-based middlewares
=================================

## Current Progress
* [x] Support express-like(use-like) and promise-based middlewares
* [x] Support Map, like `{count: Number, login: {name: String}}`
* [x] Support List, like `List(Number)`
* [x] Support Model, like `Model('User', {name: String})`
* [x] Support used with react component
* [ ] Support normalization and validation for key's value
* [ ] Support auto/manual garbage collection for non-referenced model records 
* [ ] Support serialization for the state
* [ ] Consider practice on server render phase
* [ ] Consider partial data mount and unmount, to keep store low-memory cost

## Features
* Use model to define your structured and relational data
* Support express-like(use-like) and promise-based middlewares
* Allow async call(promise/async-await) in the middleware
* Use immutable data and operates like immutable.js

## Example
```js
//store.js
//define a model
const User = Model('User', {
  name: String,//literal key
  houses: List(House),//refer another model
})
const House = Model('House', {
  addr: String,
  user: User,
})

const structure = {
  loginUser: User,
  houseCount: Number, houses: List(House),
  prices: {dollar: Number, rmb: Number}
}
const store = new Store({structure});
store.use(router);

//router.js
const router = require('use-router');
router.all('/houses/query', (req)=>{
  const store = req.store;
  let state = store.state;
  return fetch('/houses/query', {userId: state.get(['loginUser', 'id'])})
  .then((result)=>{
    const {rows, count} = result;

    store.mutate((newState)=>{
      const houses = House.merge(rows)
      newState.set('houses', newState.get('houses').push(houses));
      newState.set('houseCount', count);
      newState.set(['houseCount', 'dollar'], count*1000);
    })
  })
  .catch(err=>{

  })
})

//AllHousesListView.js
class AllHousesListView extends Component{
  componentDidMount(){
    this.props.dispatch('/houses/query');
  }
  render(){
    const elHouseList = this.props.houses.map(house=><span>{house.get('id')} {house.get('addr')}</span>)
    return (<ul>
      {elHouseList}
    </ul>)
  }
}

connect((state, dispatch)=>{
  return {houses: state.get('houses')}
})(AllHousesListView)
```

## Development
1. Run `npm run watch` in other terminal
2. Run `npm run test:only -s` to do test only work
3. Run `npm test` to do lint, build and test, before publish
4. Run `npm run cover` to do coverage test
5. Run `npm run perf` to do performance check

## License
Licensed under MIT

Copyright (c) 2017 [kiliwalk](https://github.com/kiliwalk)
