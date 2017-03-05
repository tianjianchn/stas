
const assert = require('assert');
const { List, Map } = require('..');// eslint-disable-line no-shadow

describe('immutable-state: collection.get()', function () {
  it('should throw with empty key', function () {
    assert.throws(() => new Map().get(), /Need keys path in get\(\)/);
    assert.throws(() => new Map().get(null), /Need keys path in get\(\)/);
    assert.throws(() => new Map().get(undefined), /Need keys path in get\(\)/);
    assert.throws(() => new Map().get(false), /Need keys path in get\(\)/);
    assert.throws(() => new Map().get(''), /Need keys path in get\(\)/);
  });
  it('should throw with invalid key', function () {
    assert.throws(() => new Map().get(true), /Only support number or string key in get\(\)/);
    assert.throws(() => new Map().get(new Date()), /Only support number or string key in get\(\)/);
    assert.throws(() => new Map().get({}), /Only support number or string key in get\(\)/);
    assert.throws(() => new Map().get([]), /Only support number or string key in get\(\)/);
    assert.throws(() => new Map().get([null]), /Only support number or string key in get\(\)/);
    assert.throws(() => new Map().get([undefined]), /Only support number or string key in get\(\)/);
    assert.throws(() => new Map().get([true]), /Only support number or string key in get\(\)/);
    assert.throws(() => new Map().get([false]), /Only support number or string key in get\(\)/);
    assert.throws(() => new Map().get([new Date()]), /Only support number or string key in get\(\)/);
    assert.throws(() => new Map().get([[]]), /Only support number or string key in get\(\)/);
    assert.throws(() => new Map().get([{}]), /Only support number or string key in get\(\)/);
  });
  it('should work with one part keys path', function () {
    assert.deepStrictEqual((new Map({ str: 'hello' })).get('str'), 'hello');
    assert.deepStrictEqual(new Map({ str: 'hello' }).get(['str']), 'hello');
    assert.deepStrictEqual(new List([1]).get(0), 1);
    assert.deepStrictEqual(new List([1]).get([0]), 1);
  });
  it('should work with multiple parts keys path', function () {
    assert.deepStrictEqual(new Map({ list: [1] }).get(['list', 0]), 1);
    assert.deepStrictEqual(new List([{ str: 'hello' }]).get([0, 'str']), 'hello');
  });
  it('should return undefined with nonexistent key', function () {
    assert.deepStrictEqual(new Map({ str: 'hello' }).get('num'), undefined);
    assert.deepStrictEqual(new List([1]).get(1), undefined);
  });
  it('should work with negative number key in list', function () {
    assert.deepStrictEqual(new List().get(-1), undefined);
    assert.deepStrictEqual(new List([1]).get(-1), 1);
    assert.deepStrictEqual(new List([1, 2]).get(-2), 1);
    assert.deepStrictEqual(new List([1, 2]).get(0.51), 1);
  });
  it('should work with string key in list', function () {
    assert.deepStrictEqual(new List().get('0'), undefined);
    assert.deepStrictEqual(new List().get('-1'), undefined);
    assert.deepStrictEqual(new List([1]).get('0'), 1);
    assert.deepStrictEqual(new List([1, 2]).get('1'), 2);
    assert.deepStrictEqual(new List([1, 2]).get('-1'), 2);
    assert.deepStrictEqual(new List([1, 2]).get('a'), undefined);
  });
});

