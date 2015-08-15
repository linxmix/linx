import Ember from 'ember';
import DS from 'ember-data';
import { assertPromise } from 'linx/lib/utils';

// given a path to a relationship,
// returns a property that returns the relationship if exists, else creates a new
// model for that relationship
// returns a PromiseObject
// createModelFn can return a promise
export default function(relPath, createModelFn) {
  return Ember.computed({
    get: function(key) {
      var dependentModelId = this.get(`_data.${relPath}`);

      // if not loaded, wait till loaded and try again
      if (!this.get('isLoaded')) {
        console.log("Dependent Model - NOT LOADED", key);
        return DS.PromiseObject.create({
          promise: new Ember.RSVP.Promise((resolve, reject) => {
            this.one('didLoad', () => {
              resolve(this.get(key));
            });
          }),
        });
      }

      // if relationship is empty, create default
      // TODO: leave saving up to the implementer?
      else if (!dependentModelId) {
        console.log("Dependent Model - EMPTY", key, this.get('id'));
        return DS.PromiseObject.create({
          promise: assertPromise(createModelFn.call(this)).then((model) => {
            return model.save().then(() => {
              this.set(relPath, model);
              return this.save().then(() => {
                return model;
              });
            });
          }),
        });
      }

      // if relationship is filled, return as normal
      else {
        console.log("Dependent Model - NORMAL", key);
        return this.get(relPath);
      }

    },

    set: function(key, value) {
      console.log("Dependent Model - SETTER", key);
      this.set(relPath, value);
      return value;
    }
  });
}
