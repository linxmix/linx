import Ember from 'ember';

// returns true if all given propertyPaths are present, and equal
export default function(...propertyPaths) {
  return Ember.computed.apply(Ember, propertyPaths.concat([function() {
    Ember.assert('equalProps requires 2 or more propertyPaths', propertyPaths.length >= 2);

    let vals = propertyPaths.map((path) => { return this.get(path); });

    return vals.every((val) => { return Ember.isPresent(val); }) && vals.uniq().length === 1;
  }]));
};
