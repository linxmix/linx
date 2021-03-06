import Ember from 'ember';
import DS from 'ember-data';
import _ from 'npm:underscore';

const { get } = Ember;

export const flatten = function(array) {
  return array.reduce(function(flattened, el) {
    flattened.push.apply(flattened, Ember.isArray(el) ? flatten(el) : [el]);
    return flattened;
  }, []);
};

export const bpmToBps = function(bpm) {
  return bpm / 60.0;
};

export const beatToTime = function(beat, bpm) {
  var bps = bpmToBps(bpm);
  return beat * (1.0 / bps);
};

export const timeToBeat = function(time, bpm) {
  var bps = bpmToBps(bpm);
  return time * bps;
};

export const bpmToSpb = function(bpm) {
  return 1.0 / bpmToBps(bpm);
};

export const isNumber = function(number) {
  return Ember.typeOf(number) === 'number';
};

export const isValidNumber = function(number) {
  return isNumber(number) && isFinite(number);
};

export const validNumberOrDefault = function(number, _default) {
  return isValidNumber(number) ? number : _default;
};

export const isObject = function(object) {
  return Ember.typeOf(object) === 'object';
};

export const isFunction = function(object) {
  return Ember.typeOf(object) === 'function';
};

export const isString = function(str) {
  return Ember.typeOf(str) === 'string';
};

export const clamp = function(min, n, max) {
  if (n < min) {
    return min;
  } else if (n > max) {
    return max;
  } else {
    return n;
  }
};

export const copyInPlace = function(target, copy) {
  // remove old items
  target.removeObjects(target.filter((item) => {
    return !copy.contains(item);
  }));

  // add new items
  target.addObjects(copy);
};

export const asResolvedPromise = function(returnedObject, PromiseTypeConstructor = DS.PromiseObject) {

  if (_.isArray(returnedObject)) {
    PromiseTypeConstructor = DS.PromiseArray;
  }

  return PromiseTypeConstructor.create({
    promise: new Ember.RSVP.Promise(function (resolve, reject) {
      resolve(returnedObject);
    })
  });
};

export const executePromisesInSeries = function(generators) {
  return generators.reduce((curr, next) => {
    return curr.then(next);
  }, Ember.RSVP.resolve());
};

export const assertPromise = function(obj) {
  return new Ember.RSVP.Promise(function (resolve, reject) {
    resolve(obj);
  });
};

export const getContent = function(obj, prop) {
  return obj.get(prop).then((proxy) => {
    return proxy.get('content');
  });
};

export const arraySum = function(arr) {
  return arr.reduce((sum, val) => {
    return sum + val;
  }, 0);
};

export const arrayProduct = function(arr) {
  return arr.reduce((product, val) => {
    return product * val;
  }, 1.0);
};

export const roundTo = function(x, n) {
  let rest = x % n;

  if (rest <= (n / 2)) {
    return x - rest;
  } else {
    return x + n - rest;
  }
};

// TODO(TECHDEBT): should the input field stop propagation instead?
export const makeKeybinding = function(fn) {
  return function(e) {
    const tagName = (get(e, 'target.tagName') || '').toUpperCase();
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
      e.preventDefault();
      e.stopPropagation();
      fn.call(this, e);
    }
  };
}
