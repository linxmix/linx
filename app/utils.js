import Ember from 'ember';

export const flatten = function(array) {
  return array.reduce(function(flattened, el) {
    flattened.push.apply(flattened, Ember.isArray(el) ? flatten(el) : [el]);
    return flattened;
  }, []);
}
