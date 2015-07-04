import Ember from 'ember';

export const flatten = function(array) {
  return array.reduce(function(flattened, el) {
    flattened.push.apply(flattened, Ember.isArray(el) ? flatten(el) : [el]);
    return flattened;
  }, []);
};

export const beatToTime = function(beat, bpm) {
  var bps = bpmToBps(bpm);
  return beat * (1 / bps);
};

export const timeToBeat = function(time, bpm) {
  var bps = bpmToBps(bpm);
  return time * bps;
};

export const bpmToBps = function(bpm) {
  return bpm / 60.0;
};

export const isNumber = function(number) {
  return Ember.typeOf(number) === 'number';
}
