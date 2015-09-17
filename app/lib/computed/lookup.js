import Ember from 'ember';

/*************
Example Usage:

const COLORS = {
  blue: '#00F',
  green: '#0F0',
  red: '#F00'
};

let ColorItem = Ember.Object.extend({
  color: 'blue',

  // using `lookup` macro
  colorAsHex: lookup('color', COLORS),

  // without using `lookup` macro
  colorAsHexOldWay: Ember.computed('color', function() {
    return COLORS[this.get('color')];
  })
});

var colorItem = ColorItem.create({ color: 'green' });
colorItem.get('colorAsHex') // --> '#0F0'
colorItem.set('color', 'blue');
colorItem.get('colorAsHex') // --> '#F00'

*************/

export default function(keyName, hashObject) {
  return Ember.computed(keyName, function() {
    return hashObject[this.get(keyName)];
  });
}
