
const assert = require('assert');
const { Map } = require('..');// eslint-disable-line no-shadow

describe('immutable-state: map', function () {
  describe('constructor', function () {
    it('should work with empty initial data', function () {
      assert.deepStrictEqual(Map().toJSON(), {});
      assert.deepStrictEqual(Map(null).toJSON(), {});
      assert.deepStrictEqual(Map(undefined).toJSON(), {});
      assert.deepStrictEqual(Map(false).toJSON(), {});
      assert.deepStrictEqual(Map(0).toJSON(), {});
      assert.deepStrictEqual(Map('').toJSON(), {});
    });
    it('should work with initial map', function () {
      assert.deepStrictEqual(Map({}).toJSON(), {});
      assert.deepStrictEqual(Map({ num: 1, str: 'hello', bool: true }).toJSON(), { num: 1, str: 'hello', bool: true });
      assert.deepStrictEqual(Map({ list: [1, 2], map: { str: 'hello' } }).toJSON(), { list: [1, 2], map: { str: 'hello' } });
    });
    it('should throw with invalid initial data', function () {
      assert.throws(() => Map([]), /Invalid initial data when creating map/);
      assert.throws(() => Map(new Date()), /Invalid initial data when creating map/);
      assert.throws(() => Map(1), /Invalid initial data when creating map/);
      assert.throws(() => Map('h'), /Invalid initial data when creating map/);
      assert.throws(() => Map(true), /Invalid initial data when creating map/);
    });
  });
});

