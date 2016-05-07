import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import ReadinessMixin from '../readiness';

import { flatten } from 'linx/lib/utils';
import isEvery from 'linx/lib/computed/is-every';

// Adds dependent models.
// Supports any property path which resolves to a model, or to an array of models.
// Supports mixing in multiple times for multiple dependentModels.

// Provides observable properties `hasDirtyDependentModels` and `anyDirty`.
// On save, saves dirtyDependentModels.
// On destroy, destroys dependentModels
export default function(propertyPath) {
  Ember.assert('Need propertyPath for DependentModelMixin', !!propertyPath);

  let mixinParams = {
    concatenatedProperties: ['_dependentModelPaths'],
    _dependentModelPaths: [propertyPath],

    _addDependentModelsProperty: function() {
      let dependentModelPaths = this.get('_dependentModelPaths');
      let dependentKeys = dependentModelPaths.concat(dependentModelPaths.map((path) => {
        return `${path}.[]`;
      }));

      if (!this.dependentModels) {
        Ember.defineProperty(this, 'dependentModels',
          Ember.computed.apply(Ember, dependentKeys.concat([function() {
            return flatten(dependentKeys.map((key) => {
              return this.get(key);

            // remove duplicates and empties
            })).reject(Ember.isNone).uniq();
          }]))
        );
      }
    // TODO(CLEANUP): do we need 'ready' here?
    // 'ready' is built into DS.Model
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
      }).uniq();
    }),

    hasDirtyDependentModels: Ember.computed.notEmpty('dirtyDependentModels'),
    anyDirty: Ember.computed.or('hasDirtyDependentModels', 'hasDirtyAttributes'),

    deleteDependentModels() {
      // console.log('destroy dependent models', this.get('dependentModels').toArray().map((dependentModel) => {
      //   return (dependentModel.get('content.constructor') || '').toString();
      // }));

      return Ember.RSVP.all(this.get('dependentModels').toArray().map((model) => {
        model = model.get('content') || model;
        return model && model.deleteRecord && model.deleteRecord();
      }));
    },

    destroyRecord(options = {}) {
      Ember.Logger.log("destroy master model", this.constructor.modelName, this.get('isDeleted'));

      const propPath = `___dependentRelationship_destroy_${propertyPath}`;
      const hasPropertyPath = options[propPath];

      if (!hasPropertyPath) {
        return this.deleteDependentModels().then(() => {
          return new Ember.RSVP.Promise((resolve, reject) => {
            return this.destroyRecord(_.extend(options, {
              [propPath]: true
            })).then(resolve, reject);
          });
        });
      } else {
        // console.log('continue to drestoyr master model', this.constructor.modelName, this.get('isDeleted'));
        return this._super.apply(this, arguments);
      }
    },

    saveDirtyDependentModels() {
      return Ember.RSVP.all(this.get('dirtyDependentModels').toArray().map((model) => {
        model = model.get('content') || model;
        return model && model.save && model.save();
      }));
    },

    save(options = {}) {
      let skipPath = `___dependentRelationship_Dependents_${propertyPath}`;
      Ember.Logger.log("save master model", this.constructor.modelName);

      if (!(options[skipPath] || options.skipDependents)) {
        return this.saveDirtyDependentModels().then(() => {
          return new Ember.RSVP.Promise((resolve, reject) => {
            options[skipPath] = true;
            return this.save(options).then(resolve, reject);
          });
        });
      } else {
        return this._super.apply(this, arguments);
      }
    },

    // implement readiness mixin
    _areDependentModelsReady: Ember.computed('dependentModels.@each.isLoaded', 'dependentModels.@each.content', function() {
      return this.get('dependentModels').every((dependentModel) => {
        // Ember.Logger.log("dependent model isReady", this.constructor.modelName, !dependentModel || !dependentModel.get('id') || dependentModel.get('isLoaded'), dependentModel)
        return !dependentModel || !dependentModel.get('content') || dependentModel.get('isLoaded');
      });
    }),
  };

  return Ember.Mixin.create(ReadinessMixin('_areDependentModelsReady'), mixinParams);
}
