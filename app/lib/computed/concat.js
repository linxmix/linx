import Ember from 'ember';

// things: [1, 2],
// otherThings: [2, 3, 4],
// allTheThings: concat('things', 'otherThings') => [1, 2, 2, 3, 4]
export default function concat(...properties) {
  var dependentKeys = properties.map((property) => {
    return `${property}.[]`;
  });

  return Ember.computed.apply(Ember, dependentKeys.concat([function() {
    return properties.reduce(function(acc, property) {
      var arr = this.getWithDefault(property, []);

      if (Ember.isArray(arr)) {
        acc = acc.concat(arr);
      }

      return acc;
    }.bind(this), []);
  }]));
}
