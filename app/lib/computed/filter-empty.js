import Ember from 'ember';

// nonEmptyTracks: filterEmpty('tracks')
export default function(propertyPath) {
  return Ember.computed(`${propertyPath}.[]`, function() {
    return this.get(propertyPath).filter((val) => { return Ember.isPresent(val); });
  });
}
