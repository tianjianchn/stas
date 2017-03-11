
const compose = require('uni-compose');

export default class StasBasicStore {
  _state = null;
  _subscribers = [];// listeners subscribed on state changed
  _middlewares = [];
  _stack = null;// composed middleware

  constructor(initialState) {
    this._state = initialState;
    this.dispatch = this.dispatch.bind(this);// bind this since will be used in connect()/components
  }

  get state() {
    return this._state;
  }

  getState() {
    return this._state;
  }

  use(...middlewares) {
    this._stack = null;
    const len = middlewares.length;
    for (let ii = 0; ii < len; ++ii) {
      const middleware = middlewares[ii];
      if (typeof middleware !== 'function') throw new TypeError('Only accept function in use()');
      this._middlewares.push(middleware);
    }
    return this;
  }

  clearMiddlewares() {
    this._middlewares = [];
    this._stack = null;
  }

  subscribe(listener) {
    this._subscribers.push(listener);
    const unsubscribe = () => this._subscribers.splice(this._subscribers.indexOf(listener), 1);
    return unsubscribe;
  }

  dispatch(url, body = {}) {
    if (!url || typeof url !== 'string') throw new Error('URL required in dispatch()');

    if (!this._stack) this._stack = compose(this._middlewares);// cache the stack

    const req = { store: this, method: true, url, body };
    const resp = this;

    return this._stack(req, resp);
  }

  forceUpdate() {
    this._subscribers.forEach(listener => listener(this._state, this._state));
  }

  setState(newState) {
    if (newState === this._state) return;
    const oldState = this._state;
    this._state = newState;

    this._subscribers.forEach(listener => listener(newState, oldState));
  }
}
