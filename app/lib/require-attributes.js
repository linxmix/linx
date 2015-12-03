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

import { asResolvedPromise } from 'linx/lib/utils';

export default function(...attributes) {
  return Ember.Mixin.create({
    _assertRequiredAttributes: function() {
      let readyPromise;

      asResolvedPromise(readyPromise).then(() => {
        assertRequiredAttributes(this, attributes);
      });

      this._super.apply(this, arguments);
    }.on('init')
  });
}

function assertRequiredAttributes(context, attributes) {
  attributes.forEach((attribute) => {
    Ember.assert('Must specify a ' + attribute + ' when creating a ' + context.get('constructor'),
      !Ember.isNone(context.get(attribute)));
  });
}
