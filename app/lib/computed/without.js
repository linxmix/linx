import Ember from 'ember';

// nonEmptyTracks: without('tracks', undefined)
export default function(propertyPath, withoutValue) {
  return Ember.computed(`{propertyPath.[]}`, function() {
    return this.get(propertyPath).without(withoutValue);
  });
}
