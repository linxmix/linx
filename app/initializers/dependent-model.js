import Ember from 'ember';
import DS from 'ember-data';

export default {
  name: 'DependentModel',

  initialize: function(registry, app) {
  },
};

// source: https://gist.github.com/wolfbiter/901196b6640ece365f68
/**
  Ember Data: Dependent Relationships

  This package extends Ember Data to support creating relationships
  where a model's dirty state depends not only on its own attributes
  but on the dirty state of models in dependent relationships as well.

  ```javascript
  App.Thing = DS.Model.extend({
    name     : DS.attr('string'),
    children : DS.hasMany('thing', { dependent: true })
  });

  // Load all the things

  var thing = store.findById('thing', '1');
  var child = thing.get('children.firstObject');

  thing.get('isDirty'); // false
  child.get('name'); // 'foo'

  child.set('name', 'bar');
  thing.get('isDirty'); // true

  thing.rollback();
  child.get('name'); // 'foo'
  ```

  Note that saving dependent relations automatically, and handling
  'isValid' state based on dependent relations is not supported.
*/
/* global Ember, DS */
// (function() {
//   var get = Ember.get;
//   var set = Ember.set;

//   function isDescriptor(value) {
//     // Ember < 1.11
//     if (Ember.Descriptor !== undefined) {
//       return value instanceof Ember.Descriptor;
//     }
//     // Ember >= 1.11
//     return value && typeof value === 'object' && value.isDescriptor;
//   }

//   //
//   // State machine handlers
//   //

//   // Object/array agnostic 'isDirty' check
//   function isRelatedRecordDirty(value) {
//     return Ember.isArray(value) ? Ember.A(value).isAny('isDirty') : get(value, 'isDirty');
//   }

//   // Original-state aware dirty check
//   function isRelationshipDirty(record, key) {
//     var rel = get(record, key);
//     var value = Ember.isArray(rel) ? rel.toArray() : rel;
//     var originalValue = record._dependentRelationships[key];

//     return Ember.compare(value, originalValue) !== 0;
//   }

//   // The new de facto check to determine if a record is dirty
//   function isRecordDirty(record) {
//     // First check normal attributes
//     if (Ember.keys(record._attributes).length) {
//       return true;
//     }

//     // Then check dependent relations
//     return Ember.A(Ember.keys(record._dependentRelationships)).any(function(key) {
//       return isRelationshipDirty(record, key) || isRelatedRecordDirty(get(record, key));
//     });
//   }

//   // A dependent relationship can change if:
//   //   * a belongsTo gets changed to another record
//   //   * a belongsTo record dirties/cleans
//   //   * a hasMany array gets added to or removed from
//   //   * a hasMany array has a record that dirties/cleans
//   var dependentRelationshipDidChange = function(record, context) {
//     if (Ember.compare(context.value, context.originalValue) !== 0 || isRelatedRecordDirty(context.value)) {
//       record.send('becomeDirty');
//     } else {
//       record.send('propertyWasReset', context.name);
//     }
//   };

//   // The check for whether the record is still dirty now has to account for dependent relations
//   var propertyWasReset = function(record) {
//     if (!isRecordDirty(record)) {
//       record.send('rolledBack');
//     }
//   };

//   // Check to see if the saved record is dirty
//   var savedSetup = function(record) {
//     if (isRecordDirty(record)) {
//       record.adapterDidDirty();
//     }
//   };

//   //
//   // Perform some state machine surgery
//   // TODO: figure out how to make this less ass
//   //

//   // Handle dependent relationship change
//   DS.RootState.loaded.dependentRelationshipDidChange = dependentRelationshipDidChange;

//   // Changes to dependent relations while in-flight, invalid, or deleted should not alter its state
//   DS.RootState.loaded.created.inFlight.dependentRelationshipDidChange = Ember.K;
//   DS.RootState.loaded.updated.inFlight.dependentRelationshipDidChange = Ember.K;
//   DS.RootState.loaded.created.invalid.dependentRelationshipDidChange = Ember.K;
//   DS.RootState.loaded.updated.invalid.dependentRelationshipDidChange = Ember.K;
//   DS.RootState.deleted.dependentRelationshipDidChange = Ember.K;

//   // Override the property reset handler to account for dependent relations
//   DS.RootState.loaded.created.uncommitted.propertyWasReset = propertyWasReset;
//   DS.RootState.loaded.updated.uncommitted.propertyWasReset = propertyWasReset;

//   // Handle the case when a record that is in the 'root.deleted.uncommitted' state
//   // is rolled back but has dirty dependent relations
//   DS.RootState.loaded.saved.setup = savedSetup;

//   //
//   // Modify DS.Model
//   //

//   // Add dependent property helpers
//   DS.Model.reopenClass({
//     // Loop over each dependent relation, passing the property name and the relationship meta
//     eachDependentRelationship: function(callback, binding) {
//       get(this, 'relationshipsByName').forEach(function(relationship, name) {
//         if (relationship.options.dependent) {
//           callback.call(binding, name, relationship);
//         }
//       });
//     }
//   });

//   DS.Model.reopen(Ember.Comparable, {
//     // Initialize dependent relationship snapshot object
//     _setup: function() {
//       this._super();
//       this._dependentRelationships = {};
//     },

//     // Loop over each dependent property
//     eachDependentRelationship: function(callback, binding) {
//       this.constructor.eachDependentRelationship(callback, binding || this);
//     },

//     // Hook into the object creation lifecycle in order to add dirty observers
//     didDefineProperty: function(proto, key, value) {
//       this._super(proto, key, value);

//       if (isDescriptor(value)) {
//         var meta = value.meta();

//         if (meta.isRelationship && meta.options.dependent) {
//           if (meta.kind === 'belongsTo') {
//             Ember.addObserver(proto, key + '.isDirty', null, 'dependentRelationshipDidChange');
//           } else if (meta.kind === 'hasMany') {
//             Ember.addObserver(proto, key + '.@each.isDirty', null, 'dependentRelationshipDidChange');
//           }
//         }
//       }
//     },

//     // Returns object describing of changed relationships, like `changedAttributes`
//     changedRelationships: function() {
//       var record = this;
//       var dependentRelations = record._dependentRelationships;
//       var relationship;
//       var changed = {};

//       record.eachDependentRelationship(function(name, relationshipMeta) {
//         if (record._relationships[name] && isRelationshipDirty(record, name)) {
//           relationship = get(record, name);

//           changed[name] = [
//             Ember.copy(dependentRelations[name]),
//             relationshipMeta.kind === 'belongsTo' ? relationship : relationship.toArray(),
//           ];
//         }
//       });

//       return changed;
//     },

//     // Observer for relationship change, should send state machine message 'dependentRelationshipDidChange'
//     dependentRelationshipDidChange: Ember.immediateObserver(function(record, key) {
//       var dependentRelations = record._dependentRelationships;
//       var name = key.split('.')[0];

//       if (name in dependentRelations) {
//         var value = get(record, name);

//         // Make DS.ManyArray into a vanilla array for comparison with original
//         if (Ember.isArray(value)) {
//           value = value.toArray();
//         }

//         record.send('dependentRelationshipDidChange', {
//           name          : name,
//           value         : value,
//           originalValue : dependentRelations[name],
//         });
//       }
//     }),

//     // Update the dependent relations when the adapter loads new data
//     adapterDidCommit: function() {
//       this.snapshotDependentRelations();
//       this._super.apply(this, arguments);

//       // Relationship updates don't trigger data changes anymore, so manually
//       // notify all relationship properties of possible change
//       this.eachDependentRelationship(function(name, relationship) {
//         if (relationship.kind === 'hasMany') {
//           this.dependentRelationshipDidChange(this, name);
//         }
//       });
//     },

//     // When the record is loaded/saved, save its relations so they can be reverted
//     snapshotDependentRelations: function() {
//       var record = this;
//       var dependentRelations = record._dependentRelationships;
//       var relationship;

//       record.eachDependentRelationship(function(name, relationshipMeta) {
//         if (record._relationships[name]) {
//           relationship = get(record, name);

//           dependentRelations[name] = relationshipMeta.kind === 'belongsTo' ? relationship : relationship.toArray();
//         }
//       });
//     }.on('didLoad'),

//     // Dependent relations rely on the 'isDirty' CP, which may not get called
//     precomputeIsDirty: function() {
//       get(this, 'isDirty');
//     }.on('init'),

//     // Rollback relations as well as attributes
//     rollback: function() {
//       // Revert attributes like normal
//       this._super();

//       var record = this;
//       var dependentRelations = this._dependentRelationships;

//       record.eachDependentRelationship(function(name, relationshipMeta) {
//         if (name in dependentRelations) {
//           var originalRelationship = dependentRelations[name];

//           if (relationshipMeta.kind === 'belongsTo') {
//             set(record, name, originalRelationship);
//           } else {
//             get(record, name).setObjects(originalRelationship);
//           }

//           // Rollback child/field records that have changed as well
//           Ember.makeArray(originalRelationship).filterBy('isDirty').invoke('rollback');
//         }
//       });
//     },

//     // Basic identity comparison to allow `Ember.compare` to work on models
//     compare: function(r1, r2) {
//       return r1 === r2 ? 0 : 1;
//     },
//   });
// }());
