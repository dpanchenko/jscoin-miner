const Layer = require('express/lib/router/layer');

function isAsync(fn) {
  const type = Object.toString.call(fn.constructor);
  return type.indexOf('AsyncFunction') !== -1;
}

function wrap(fn) {
  return (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch(err => next(err));
    }
  };
}

Object.defineProperty(Layer.prototype, 'handle', {
  enumerable: true,
  get() {
    return this.__handle;
  },
  set(fn) {
    if (isAsync(fn)) {
      fn = wrap(fn); // eslint-disable-line no-param-reassign
    }
    this.__handle = fn;
  },
});

