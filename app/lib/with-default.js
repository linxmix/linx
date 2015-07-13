import Ember from 'ember';

// scoreWithDefault: withDefault('score', 3.0)
export default function(propertyPath, defaultValue) {
  return Ember.computed(function(key, value) {
    if (arguments.length > 1) {
      this.set(propertyPath, value);
    }

    return this.get(propertyPath) || defaultValue;
  });
};
