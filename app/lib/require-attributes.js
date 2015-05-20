// Creates a mixin which asserts attributes exist upon initialization
// Usage:

// import RequireAttributes from ‘/lib/require-attributes’;

// export default Ember.Component.extend(
//   RequireAttributes(‘name’, ‘value’), {

// });

import Ember from 'ember';

export default function() {
  var attributes = Array.prototype.slice.call(arguments);

  return Ember.Mixin.create({
    assertAttributes: function() {
      attributes.forEach((attribute) => {
        Ember.assert('Must specify a ' + attribute + ' to use ' + this.get('constructor'), this.get(attribute));
      });
    }.on('init'),
  });
}
