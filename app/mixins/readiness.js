import Ember from 'ember';

// Adds readiness.
// Supports any property path which resolves to a boolean.
// Supports mixing in multiple times for multiple readiness properties.
// Supports mixing into models, objects and components.

// exposes "didBecomeReady" event
// exposes "readyPromise"
export default function(propertyPath) {
  Ember.assert('Need propertyPath for ReadinessMixin', !!propertyPath);

  let mixinParams = {
    concatenatedProperties: ['_readinessPaths'],
    _readinessPaths: [propertyPath],

    _addIsReadyProperty: function() {
      let readinessKeys = this.get('_readinessPaths');

      // isReady if all readinessKeys are ready
      Ember.defineProperty(this, 'isReady',
        Ember.computed.apply(Ember, readinessKeys.concat([function() {
          // console.log("IS READY", this.constructor.toString(), readinessKeys);
          return readinessKeys.every((key) => {
            // console.log("key", key);
            return this.get(key) === true;
          });
        }]))
      );
    }.on('init', 'ready'),

    isReady: false,

    _didBecomeReady: function() {
      if (this.get('isReady')) {
        this.trigger('didBecomeReady');
      }
    }.on('init', 'ready').observes('isReady'),

    readyPromise: Ember.computed(function() {
      return new Ember.RSVP.Promise((resolve, reject) => {
        if (this.get('isReady')) {
          resolve(this);
        } else {
          this.one('didBecomeReady', () => {
            resolve(this);
          });
        }
      });
    }),
  };

  return Ember.Mixin.create(mixinParams);
}
