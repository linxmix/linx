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
import DS from 'ember-data';

export default function(...attributes) {
  return Ember.Mixin.create({
    _assertRequiredAttributes: function() {

      // if the object we're mixing into is a model, wait till it's ready
      if (this instanceof DS.Model) {
        this.one('ready', () => {
          assertRequiredAttributes(this, attributes);
        });
      } else {
        assertRequiredAttributes(this, attributes);
      }

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
