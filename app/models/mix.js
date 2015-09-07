import Ember from 'ember';
import DS from 'ember-data';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';
import ReadinessMixin from 'linx/mixins/readiness';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import { flatten, asResolvedPromise } from 'linx/lib/utils';
import add from 'linx/lib/computed/add';

const MixItemFunctionsMixin = function(...modelNames) {
  return Ember.Mixin.create(modelNames.reduce((mixinParams, modelName) => {
    let capitalizedModelName = Ember.String.capitalize(modelName);

    // insertItemAt
    let insertAtFnKey = `insert${capitalizedModelName}At`;
    mixinParams[insertAtFnKey] = function(index, model) {
      return this.createItemAt(index).setModel(model);
    };

    // appendItem
    mixinParams[`append${capitalizedModelName}`] = function(model) {
      return this[insertAtFnKey](this.get('index'), model);
    };

    // items
    let itemsKey = `${modelName}Items`;
    mixinParams[itemsKey] = Ember.computed.filterBy('items', `is${capitalizedModelName}`);

    // models
    mixinParams[`${modelName}s`] = Ember.computed.mapBy(itemsKey, 'model');

    return mixinParams;
  }, {}));
};

export default DS.Model.extend(
  ReadinessMixin('isMixReady'),
  MixItemFunctionsMixin('track', 'transition', 'mix'), // TODO(POLYMORPHISM)
  DependentRelationshipMixin('arrangement'),
  OrderedHasManyMixin({ itemModelName: 'mix-item', itemsPath: 'items' }), {

  title: DS.attr('string'),
  items: DS.hasMany('mix-item', { async: true, defaultValue: () => [] }),

  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    let arrangement = this.get('store').createRecord('arrangement');
    return arrangement;
  }),

  // implement readiness mixin
  isMixReady: Ember.computed.bool('arrangement.isReady'),

  // adds transition when appending given track
  appendTrackWithTransition(track) {
    return this.insertTrackAtWithTransitions(this.get('length'), track);
  },

  // adds transitions when inserting given track
  insertTrackAtWithTransitions(index, track) {
    let prevItem = this.objectAt(index - 1);
    let nextItem = this.objectAt(index);
    // TODO(TRANSITION)
  },

  // adds matching tracks when appending given transition
  appendTransitionWithTracks(transition) {
    return this.insertTransitionAtWithTracks(this.get('length'), transition);
  },

  // adds matching tracks when inserting given transition
  insertTransitionAtWithTracks(index, transition) {
    let prevItem = this.objectAt(index - 1);
    let nextItem = this.objectAt(index);

    return this.get('readyPromise').then(() => {
      let expectedFromTrack = transition.get('fromTrack.content');
      let expectedToTrack = transition.get('toTrack.content');
      let actualFromTrack = prevItem && prevItem.get('clipModel.content');
      let actualToTrack = nextItem && nextItem.get('clipModel.content');

      // insert fromTrack if not already present
      if (!actualFromTrack || actualFromTrack !== expectedFromTrack) {
        return this.insertTrackAt(index, expectedFromTrack).then(() => {
          return this.insertTransitionAtWithTracks(index + 1, transition);
        });
      }

      // insert toTrack if not already present
      if (!actualToTrack || actualToTrack !== expectedToTrack) {
        return this.insertTrackAt(index, expectedToTrack).then(() => {
          return this.insertTransitionAtWithTracks(index, transition);
        });
      }

      // insert transition
      return this.insertTransitionAt(index, transition);
    });
  },
});
