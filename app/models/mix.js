import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

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

  appendTrackWithTransition(track) {
    return this.insertTrackAtWithTransitions(this.get('length'), track);
  },

  // may override existing transitions
  insertTrackAtWithTransitions(index, track, options) {
    return this.get('readyPromise').then(() => {
      return this.insertTrackAt(index, track).then((trackItem) => {
        return this.assertTransitionsForItem(trackItem, options).then(() => {
          return trackItem;
        });
      });
    });
  },

  // asserts transitions are present and valid around given item
  assertTransitionsForItem(item, options) {
    Ember.assert('Cannot assertTransitionsForItem without item', Ember.isPresent(item));
    Ember.assert('Cannot assertTransitionsForItem when item isTransition', item.get('isTransition'));

    return this.generateTransitionItemAt(item.get('index') - 1, options).then((prevTransitionItem) => {
      return this.generateTransitionItemAt(item.get('index') + 1, options).then((nextTransitionItem) => {
        return { prevTransitionItem, nextTransitionItem };
      });
    });
  },

  // generates valid transition item at given index, if possible
  generateTransitionItemAt(index, options) {
    return this.get('readyPromise').then(() => {
      let item = this.objectAt(index);

      // if item already is valid transition, return it
      if (item.get('isValidTransition')) {
        return item;
      } else {
        let prevItem = this.objectAt(index - 1);
        let nextItem = this.objectAt(index);

        // cannot make transition without prevItem and nextItem
        if (!(prevItem && nextItem)) {
          return;
        }

        // make sure prevItem is not a transition
        if (prevItem && prevItem.get('isTransition')) {
          this.removeObject(prevItem);
          return this.generateTransitionItemAt(index - 1);
        }

        // make sure nextItem is not a transition
        if (nextItem && nextItem.get('isTransition')) {
          this.removeObject(nextItem);
          return this.generateTransitionItemAt(index);
        }

        // all is well - proceed with transition generation
        return this.generateTransitionFromClips(prevItem.get('clip'), nextItem.get('clip'), options).then((transition) => {
          return this.insertTransitionAt(index, transition);
        });
      }
    });
  },

  // returns a new transition model between two given clips, with options
  generateTransitionFromClips(fromClip, toClip, options = {}) {
    Ember.assert('Must have fromClip and toClip to generateTransitionFromClips', Ember.isPresent(fromClip) && Ember.isPresent(toClip));

    return this.get('readyPromise').then(() => {
      let {
        lastTrack: fromTrack,
        clipEndBeat: minFromTrackEndBeat
      } = fromClip.getProperties('lastTrack', 'clipEndBeat');

      let {
        firstTrack: toTrack,
        clipStartBeat: maxToTrackStartBeat
      } = toClip.getProperties('firstTrack', 'clipStartBeat');

      return this.generateTransitionFromTracks(fromTrack, toTrack, _.defaults({}, options, {
        minFromTrackEndBeat,
        maxToTrackStartBeat
      }));
    });
  },

  // returns a new transition model between two given tracks, with options
  generateTransitionFromTracks(fromTrack, toTrack, options = {}) {
    Ember.assert('Must have fromTrack and toTrack to generateTransitionFromTracks', Ember.isPresent(fromTrack) && Ember.isPresent(toTrack));

    return this.get('readyPromise').then(() => {
      let {
        preset,
        minFromTrackEndBeat,
        maxToTrackStartBeat,
        fromTrackEnd,
        toTrackStart,
      } = options;

      // TODO(TRANSITION): improve this algorithm, add options and presets
      let transition = this.get('store').createRecord('transition', {
        fromTrack,
        toTrack,
      });

      return Ember.RSVP.all([
        transition.setFromTrackEnd(fromTrack.get('audioMeta.lastBeatMarker.start')),
        transition.setToTrackStart(toTrack.get('audioMeta.firstBeatMarker.start')),
      ]).then(() => {
        return transition;
      });
    });
  },

  optimizeMix() {
    // TODO
  },

  appendTransitionWithTracks(transition) {
    return this.insertTransitionAtWithTracks(this.get('length'), transition);
  },

  insertTransitionAtWithTracks(index, transition) {
    return this.get('readyPromise').then(() => {
      let prevItem = this.objectAt(index - 1);
      let nextItem = this.objectAt(index);
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
