// Creates a mixin which asserts attributes exist upon initialization
// Usage:

// import RequireAttributes from ‘linx/lib/require-attributes’;

// export default Ember.Component.extend(
//   RequireAttributes(‘name’, 'model'), {
//
//   somePropertyThatNeedsModel: function() {
//     return this.get('model.someProperty');
//   }.property('value')
// });

import Ember from 'ember';

export default function(...attributes) {
  return Ember.Mixin.create({
    _assertRequiredAttributes: function() {
      attributes.forEach((attribute) => {
        Ember.assert('Must specify a ' + attribute + ' when creating a ' + this.get('constructor'),
          !Ember.isNone(this.get(attribute)));
      });
      this._super.apply(this, arguments);
    }.on('init')
  });
}
