import Ember from 'ember';

export default function(propertyPath) {
  return Ember.computed(propertyPath, function() {
    return `${this.get(propertyPath)}px`;
  });
}
