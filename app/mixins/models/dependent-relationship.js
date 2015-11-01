import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from '../readiness';

import _ from 'npm:underscore';
import { flatten } from 'linx/lib/utils';
import isEvery from 'linx/lib/computed/is-every';

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

      if (!this.dependentModels) {
        Ember.defineProperty(this, 'dependentModels',
          Ember.computed.apply(Ember, dependentKeys.concat([function() {
            return flatten(dependentKeys.map((key) => {
              return this.get(key);
            }));
          }]))
        );
      }
    }.on('init', 'ready'),

    dependentModels: null,

    dependentModelsWithDirtyAttributes:
      Ember.computed.filterBy('dependentModels', 'hasDirtyAttributes', true),

    dependentModelsWithDirtyDependentModels:
      Ember.computed.filterBy('dependentModels', 'hasDirtyDependentModels', true),

    // handle async and sync models
    _dirtyDependentModels: Ember.computed.uniq('dependentModelsWithDirtyAttributes', 'dependentModelsWithDirtyDependentModels'),
    dirtyDependentModels: Ember.computed('_dirtyDependentModels.@each.content', function() {
      return this.get('_dirtyDependentModels').map((model) => {
        return model.get('content') || model;
      });
    }),

    hasDirtyDependentModels: Ember.computed.notEmpty('dirtyDependentModels'),
    anyDirty: Ember.computed.or('hasDirtyDependentModels', 'hasDirtyAttributes'),

    destroyDependentModels() {
      return Ember.RSVP.all(this.get('dependentModels').toArray().map((model) => {
        // TODO(CLEANUP)
        return model.destroyRecord && model.destroyRecord();
      }));
    },

    destroyRecord() {
      console.log("destroy master model", this.constructor.modelName);
      return this.destroyDependentModels().then(() => {
        this.deleteRecord();
        return this.save();
      });
    },

    saveDirtyDependentModels() {
      return Ember.RSVP.all(this.get('dirtyDependentModels').map((model) => {
        return model.save();
      }));
    },

    save(options = {}) {
      let { skipDependents } = options;

      if (!skipDependents) {
        return this.saveDirtyDependentModels().then(() => {
          return new Ember.RSVP.Promise((resolve, reject) => {
            options.skipDependents = true;
            this.save(options).then(resolve, reject);
          });
        });
      } else {
        console.log("save master model", this.constructor.modelName);
        return this._super.apply(this, arguments);
      }
    },

    // TODO: figure this out
    // implement readiness mixin
    // _areDependentModelsReady: isEvery('dependentModels', 'isLoaded', true),

    // implement readiness mixin
    _areDependentModelsReady: Ember.computed('dependentModels.@each.isLoaded', 'dependentModels.@each.id', function() {
      return this.get('dependentModels').every((dependentModel) => {
        // console.log("dependent model isReady", this.constructor.modelName, !dependentModel || !dependentModel.get('id') || dependentModel.get('isLoaded'), dependentModel)
        return !dependentModel || !dependentModel.get('id') || dependentModel.get('isLoaded');
      });
    }),
  };

  return Ember.Mixin.create(ReadinessMixin('_areDependentModelsReady'), mixinParams);
}
