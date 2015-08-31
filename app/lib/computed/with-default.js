import Ember from 'ember';

// scoreWithDefault: withDefault('score', 3.0)
export default function(propertyPath, defaultValue) {
  return Ember.computed(propertyPath, {
    get() {
      let propertyValue = this.get(propertyPath);
      return !Ember.isNone(propertyValue) ? propertyValue : defaultValue;
    },

    set(key, value) {
      this.set(propertyPath, value);
      return value;
    }
  });
}

export const withDefaultProperty = function(propertyPath, defaultPath) {
  return Ember.computed(propertyPath, defaultPath, {
    get() {
      let propertyValue = this.get(propertyPath);
      return !Ember.isNone(propertyValue) ? propertyValue : this.get(defaultPath);
    },

    set(key, value) {
      this.set(propertyPath, value);
      return value;
    }
  });
};
