import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';
import { flatten } from 'linx/lib/utils';

// Adds dependent models.
// Supports any property path which resolves to a model, or to an array of models.
// Supports mixing in multiple times for multiple dependentModels.

// Provides observable properties `hasDirtyDependentModels` and `isDirty`.
// On save, saves dirtyDependentModels.
// On destroy, destroys dependentModels
export default function(propertyPath) {
  Ember.assert('Need propertyPath for DependentModelMixin', !!propertyPath);

  let mixinParams = {
    concatenatedProperties: ['_dependentModelPaths'],
    _dependentModelPaths: [propertyPath],

    _addDependentModelsProperty: function() {
      let dependentKeys = this.get('_dependentModelPaths');

      Ember.defineProperty(this, 'dependentModels',
        Ember.computed.apply(Ember, dependentKeys.concat([function() {
          return flatten(dependentKeys.map((key) => {
            return this.get(key);
          }));
        }]))
      );
    }.on('init'),

    dependentModels: null,

    dependentModelsWithDirtyAttributes:
      Ember.computed.filterBy('dependentModels', 'hasDirtyAttributes', true),

    dependentModelsWithDirtyDependentModels:
      Ember.computed.filterBy('dependentModels', 'hasDirtyDependentModels', true),

    // handle async and sync models
    _dirtyDependentModels: Ember.computed.uniq('dependentModelsWithDirtyAttributes', 'dependentModelsWithDirtyDependentModels'),
    dirtyDependentModels: Ember.computed('_dirtyDependentModels.[].content', function() {
      return this.get('_dirtyDependentModels').map((model) => {
        return model.get('content') || model;
      });
    }),

    hasDirtyDependentModels: Ember.computed.notEmpty('dirtyDependentModels'),
    anyDirty: Ember.computed.or('hasDirtyDependentModels', 'hasDirtyAttributes'),

    destroyDependentModels() {
      return Ember.RSVP.all(this.get('dependentModels').toArray().map((model) => {
        return model.destroyRecord();
      }));
    },

    destroyRecord() {
      console.log("destroy master model", this.constructor.modelName);
      return Ember.RSVP.all([
        this._super.apply(this, arguments),
        this.destroyDependentModels(),
      ]);
    },

    saveDirtyDependentModels() {
      return Ember.RSVP.all(this.get('dirtyDependentModels').map((model) => {
        return model.save();
      }));
    },

    save() {
      if (this.get('hasDirtyDependentModels')) {
        console.log("saving dirty dependent models", this.constructor.modelName, this.get('dirtyDependentModels'));
        return this.saveDirtyDependentModels().then(() => {
          // TODO: why doesnt hasDirtyAttributes not update immediately?
          Ember.run.next(this, 'save');
        });
      } else {
        console.log("no dirty dependents, saving master model", this.constructor.modelName);
        return this._super.apply(this, arguments);
      }
    }
  };

  return Ember.Mixin.create(mixinParams);
};
