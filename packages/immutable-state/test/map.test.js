
const assert = require('assert');
const { Map } = require('..');// eslint-disable-line no-shadow

describe('immutable-state: map', function () {
  describe('constructor', function () {
    it('should work with empty initial data', function () {
      assert.deepStrictEqual(new Map().toJSON(), {});
      assert.deepStrictEqual(new Map(null).toJSON(), {});
      assert.deepStrictEqual(new Map(undefined).toJSON(), {});
      assert.deepStrictEqual(new Map(false).toJSON(), {});
      assert.deepStrictEqual(new Map(0).toJSON(), {});
      assert.deepStrictEqual(new Map('').toJSON(), {});
    });
    it('should work with initial map', function () {
      assert.deepStrictEqual(new Map({}).toJSON(), {});
      assert.deepStrictEqual(new Map({ num: 1, str: 'hello', bool: true }).toJSON(), { num: 1, str: 'hello', bool: true });
      assert.deepStrictEqual(new Map({ list: [1, 2], map: { str: 'hello' } }).toJSON(), { list: [1, 2], map: { str: 'hello' } });
    });
    it('should throw with invalid initial data', function () {
      assert.throws(() => new Map([]), /Invalid initial data when creating map/);
      assert.throws(() => new Map(new Date()), /Invalid initial data when creating map/);
      assert.throws(() => new Map(1), /Invalid initial data when creating map/);
      assert.throws(() => new Map('h'), /Invalid initial data when creating map/);
      assert.throws(() => new Map(true), /Invalid initial data when creating map/);
    });
  });
});

