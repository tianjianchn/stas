/* eslint no-prototype-builtins:off */

function inherits(construtor, superConstructor) {
  // obj.constructor.super = superConstructor or original:
  // obj.constructor.prototype.__proto__.constructor
  constructor.super = superConstructor;

  construtor.prototype = Object.create(superConstructor.prototype, {
    constructor: {
      value: construtor,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
}

module.exports = {
  inherits,
};

