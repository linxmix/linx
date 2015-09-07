import Ember from 'ember';
import DS from 'ember-data';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import { flatten, asResolvedPromise } from 'linx/lib/utils';
import add from 'linx/lib/computed/add';

// TODO: move to insertModelAt, appendModel?
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
}

export default DS.Model.extend(
  MixItemFunctionsMixin('track', 'transition', 'mix'), // TODO(POLYMORPHISM)
  DependentRelationshipMixin('arrangement'),
  OrderedHasManyMixin({ itemModelName: 'mix-item', itemsPath: 'items' }), {

  title: DS.attr('string'),
  items: DS.hasMany('mix-item', { async: true, defaultValue: () => [] }),

  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    let arrangement = this.get('store').createRecord('arrangement');
    arrangement.get('mixes').addObject(this);
    return arrangement;
  }),

  // adds matching tracks when appending given transition
  appendTransitionWithTracks(transition) {
    return this.insertTransitionAtWithTracks(this.get('length'), transition);
  },

  // adds matching tracks when inserting given transition
  insertTransitionAtWithTracks(index, transition) {
    let prevItem = this.objectAt(index - 1);
    let nextItem = this.objectAt(index);

    let expectedFromTrack, actualFromTrack, expectedToTrack, actualToTrack;

    // first make sure all necessary async models are loaded
    let expectedFromTrackPromise = transition.get('fromTrack').then((track) => {
      expectedFromTrack = track;
    });
    let expectedToTrackPromise = transition.get('toTrack').then((track) => {
      expectedToTrack = track;
    });
    let actualFromTrackPromise = prevItem && prevItem.get('clip').then((clip) => {
      return clip && clip.get('model').then((model) => {
        actualFromTrack = model;
      });
    });
    let actualToTrackPromise = nextItem && nextItem.get('clip').then((clip) => {
      return clip && clip.get('model').then((model) => {
        actualToTrack = model;
      });
    });

    console.log("insertTransitionAtWithTracks", index)

    // handle actual insertions
    return Ember.RSVP.all([expectedFromTrackPromise, expectedToTrackPromise, actualFromTrackPromise, actualToTrackPromise]).then(() => {

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
