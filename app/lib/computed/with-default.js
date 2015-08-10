import Ember from 'ember';

// scoreWithDefault: withDefault('score', 3.0)
export default function(propertyPath, defaultValue) {
  return Ember.computed(propertyPath, {
    get: function() {
      var propertyValue = this.get(propertyPath)
      return !Ember.isNone(propertyValue) ? propertyValue : defaultValue;
    },

    set: function(key, value) {
      this.set(propertyPath, value);
      return value;
    }
  });
};
