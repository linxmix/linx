import Ember from 'ember';
import DS from 'ember-data';
import { asResolvedPromise } from 'linx/lib/utils';
import _ from 'npm:underscore';

// given a path to a relationship,
// returns a property that returns the relationship if exists, else creates a new
// model for that relationship
// returns a PromiseObject
// createModelFn can return a promise
export default function(relPath, createModelFn) {
  return Ember.computed({
    get: function(key) {
      var dependentModelId = this.get(`_internalModel._relationships.initializedRelationships.${relPath}.inverseRecord.id`);

      // if not loaded, wait till loaded and try again
      if (!this.get('isLoaded')) {
        console.log("WithDefaultModel - NOT LOADED", key);
        return DS.PromiseObject.create({
          promise: new Ember.RSVP.Promise((resolve, reject) => {
            this.one('didLoad', () => {
              resolve(this.get(key));
            });
          }),
        });
      }

      // if relationship is empty, create default
      else if (!dependentModelId) {
        console.log("WithDefaultModel - EMPTY", key, this.get('id'));

        return DS.PromiseObject.create({
          promise: asResolvedPromise(createModelFn.call(this)).then((model) => {
            this.set(relPath, model);
            return model;

            // TODO: make save optional
            // return model.save().then(() => {
              // return this.save().then(() => {
                // return model;
              // });
            // });
          }),
        });
      }

      // if relationship is filled, return as normal
      else {
        console.log("WithDefaultModel - NORMAL", key);
        return this.get(relPath);
      }

    },

    set: function(key, value) {
      console.log("WithDefaultModel - SETTER", key);
      this.set(relPath, value);
      return value;
    }
  });
}
