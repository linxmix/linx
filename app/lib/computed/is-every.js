import Ember from 'ember';

// isReady: isEvery('clips', 'isReady', true)
export default function(propertyPath, eachPath, value) {
  return Ember.computed(`{propertyPath.@each.eachPath}`, function() {
    return this.get(propertyPath).isEvery(eachPath, value);
  });
}
