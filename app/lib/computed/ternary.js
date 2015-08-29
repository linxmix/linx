import { computed } from 'ember';

export function constantTernary(property, trueValue, falseValue) {
  return computed(property, function() {
    return this.get(property) ? trueValue : falseValue;
  });
}

export function variableTernary(property, trueProperty, falseProperty) {
  return computed(property, trueProperty, falseProperty, function() {
    return this.get(property) ? this.get(trueProperty) : this.get(falseProperty);
  });
}

export function propertyOrDefault(property, trueProperty, defaultValue) {
  return computed(property, trueProperty, function() {
    return this.get(property) ? this.get(trueProperty) : defaultValue;
  });
}
