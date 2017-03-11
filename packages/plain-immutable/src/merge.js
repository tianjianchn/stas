
import immutable from './index';
import { stringify } from './util';

/**
 * merge the value using specific strategy.
 * @param strategy true|function. true for deep merge, or function for custom merge
 */
export default function merge(strategy, value) {
  if (arguments.length < 2) {
    value = strategy;
    strategy = normalMerger;
  } else {
    // validate strategy
    const type = typeof strategy;
    if (type !== 'boolean' && type !== 'function') {
      throw new TypeError(`Invalid strategy: ${stringify(strategy)}, expect boolean or function`);
    }
    if (type !== 'function') {
      strategy = strategy ? deepMerger : normalMerger;
    }
  }

  // validate value
  if (!value || typeof value !== 'object') {
    throw new TypeError(`Invalid value: ${stringify(value)}, expect array or object`);
  }
  if (Array.isArray(value) !== Array.isArray(this)) {
    throw new TypeError(`Invalid value: ${stringify(value)}, expect same type(array or object)`);
  }

  let newThis;

  Object.keys(value).forEach((key) => {
    const nextItem = value[key],
      prevItem = this[key];
    if (prevItem === nextItem) return;

    if (!newThis) newThis = this.mutable();// delay to call mutable only when needed
    newThis[key] = strategy(prevItem, nextItem, key);
  });

  if (newThis) return immutable(newThis);
  else return this;
}

function normalMerger(prev, next) {
  return next;
}

function deepMerger(prev, next) {
  if (!prev || !next) return next;
  if (typeof prev !== 'object' || typeof next !== 'object') return next;
  if (Array.isArray(prev) !== Array.isArray(next)) return next;
  return prev.merge(deepMerger, next);
}
