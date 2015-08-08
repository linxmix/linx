import Ember from 'ember';

export const flatten = function(array) {
  return array.reduce(function(flattened, el) {
    flattened.push.apply(flattened, Ember.isArray(el) ? flatten(el) : [el]);
    return flattened;
  }, []);
};

export const beatToTime = function(beat, bpm) {
  var bps = bpmToBps(bpm);
  return beat * (1.0 / bps);
};

export const timeToBeat = function(time, bpm) {
  var bps = bpmToBps(bpm);
  return time * bps;
};

export const bpmToBps = function(bpm) {
  return bpm / 60.0;
};

export const bpmToSpb = function(bpm) {
  return 1.0 / bpmToBps(bpm);
};

export const isNumber = function(number) {
  return Ember.typeOf(number) === 'number';
};

export const isObject = function(object) {
  return Ember.typeOf(object) === 'object';
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

export const assertPromise = function(x) {
  return new Ember.RSVP.Promise(function(resolve) {
    resolve(x);
  });
};
