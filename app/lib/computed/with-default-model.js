import Ember from 'ember';
import DS from 'ember-data';
import { asResolvedPromise } from 'linx/lib/utils';
import _ from 'npm:underscore';

function getOrCreateModel(key, relPath, createModelFn) {
  let dependentModelId = this.get(`_internalModel._relationships.initializedRelationships.${relPath}.inverseRecord.id`);

  // if relationship is empty, create default
  if (!dependentModelId) {
    Ember.Logger.log("WithDefaultModel - EMPTY", key, this.get('id'));

    return DS.PromiseObject.create({
      promise: asResolvedPromise(createModelFn.call(this)).then((model) => {
        this.set(relPath, model);
        return model;

        // TODO(CLEANUP): make save optional?
        // return model.save().then(() => {
          // return this.save().then(() => {
            // return model;
          // });
        // });
      }),
    });
  }

  // relationship is filled, return as normal
  else {
    Ember.Logger.log("WithDefaultModel - NORMAL", key);
    return this.get(relPath);
  }
}

// given a path to a relationship,
// returns a property that returns the relationship if exists, else creates a new
// model for that relationship
// returns a PromiseObject
// createModelFn can return a promise
export default function(relPath, createModelFn) {
  return Ember.computed({
    get: function(key) {
      // if not loaded, wait till loaded and try
      if (!this.get('isLoaded')) {
        Ember.Logger.log("WithDefaultModel - NOT LOADED", key);
        return DS.PromiseObject.create({
          promise: new Ember.RSVP.Promise((resolve, reject) => {
            this.one('didLoad', () => {
              resolve(getOrCreateModel.call(this, key, relPath, createModelFn));
            });
          }),
        });
      } else {
        return getOrCreateModel.call(this, key, relPath, createModelFn);
      }
    },

    set: function(key, value) {
      Ember.Logger.log("WithDefaultModel - SETTER", key);
      this.set(relPath, value);
      return value;
    }
  });
}
