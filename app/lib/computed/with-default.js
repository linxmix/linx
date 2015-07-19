import Ember from 'ember';

// scoreWithDefault: withDefault('score', 3.0)
export default function(propertyPath, defaultValue) {
  return Ember.computed(propertyPath, function(key, value) {

    // setter
    if (arguments.length > 1) {
      this.set(propertyPath, value);
    }

    // getter
    return this.get(propertyPath) || defaultValue;
  });
};
