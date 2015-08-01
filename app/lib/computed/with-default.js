import Ember from 'ember';

// scoreWithDefault: withDefault('score', 3.0)
export default function(propertyPath, defaultValue) {
  return Ember.computed(propertyPath, {
    get: function() {
      return this.get(propertyPath) || defaultValue;
    },

    set: function(key, value) {
      this.set(propertyPath, value);
      return value;
    }
  });
};
