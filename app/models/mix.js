import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';

export default DS.Model.extend(
  PlayableArrangementMixin,
  OrderedHasManyMixin('_mixItems', 'mix/item'), {

  title: DS.attr('string'),
  _mixItems: DS.hasMany('mix/item', { async: true }),

  fromTracks: Ember.computed.mapBy('items', 'fromTrack.content'),
  toTracks: Ember.computed.mapBy('items', 'toTrack.content'),
  tracks: Ember.computed.uniq('fromTracks', 'toTracks'),
  transitions: Ember.computed.mapBy('items', 'transition'),

  fromTrackClips: Ember.computed('items.@each.fromTrackClip', function() {
    return this.get('items').mapBy('fromTrackClip');
  }),
  toTrackClips: Ember.computed('items.@each.toTrackClip', function() {
    return this.get('items').mapBy('toTrackClip');
  }),

  trackClips: Ember.computed.uniq('fromTrackClips', 'toTrackClips'),
  transitionClips: Ember.computed.mapBy('items', 'transitionClip'),
  clips: Ember.computed.uniq('trackClips', 'transitionClips'),

  trackAt(index) {
    let item = this.objectAt(index);
    return item && item.get('fromTrack.content');
  },

  transitionAt(index) {
    let item = this.objectAt(index);
    return item && item.get('transition.content');
  },

  appendTransition(transition) {
    return this.insertTransitionAt(this.get('length'), transition);
  },

  insertTransitionAt(index, transition) {
    return this.createAt(index, { transition });
  },

  insertTransitionsAt(index, transitions) {
    let items = transitions.map((transition) => {
      return this.createItem({ transition });
    });

    return this.replace(index, 0, items);
  },

  appendTransitions(transitions) {
    return this.insertTransitionsAt(this.get('length'), transitions);
  },

  generateTransitionAt(index, options) {
    let item = this.getOrCreateAt(index);

    return item.generateTransition(options);
  },

  generateAndAppendTransition(options) {
    return this.generateTransitionAt(this.get('length'), options);
  },

  assertTransitionAt(index, options) {
    let item = this.getOrCreateAt(index);

    return item.assertTransition(options);
  },
});


//   insertTransitionAt(index, transition) {
//     let item = this.objectAt(index);

//     Ember.assert('Must have item at index to insertTransitionAt', item);

//     return item && item.setTransition(transition);
//   },

//   appendModel(model) {
//     return this.insertModelAt(this.get('length'), model);
//   },

//   appendModels(models) {
//     return this.insertModelsAt(this.get('length'), models);
//   },

//   insertModelsAt(index, models) {
//     return executePromisesInSeries(models.map((model, i) => {
//       return () => {
//         return this.insertModelAt(index + i, model);
//       };
//     }));
//   },

//   appendModelWithTransition(track) {
//     return this.insertModelAtWithTransitions(this.get('length'), track);
//   },

//   // may override existing transitions
//   insertModelAtWithTransitions(index, track, options) {
//     return this.get('readyPromise').then(() => {
//       return this.insertModelAt(index, track).then((trackItem) => {
//         return this.assertTransitionsAt(index, options).then(() => {
//           return trackItem;
//         });
//       });
//     });
//   },

//   // asserts transitions are present and valid around given item, if possible
//   assertTransitionsAt(index) {
//     return Ember.RSVP.all([
//       this.assertTransitionAt(index - 1),
//       this.assertTransitionAt(index),
//     ]);
//   },

//   assertTransitionAt(index, options) {
//     let item = this.objectAt(index);

//     return item && item.assertTransition(options);
//   },

//   generateTransitionAt(index, options) {
//     let item = this.objectAt(index);

//     return item && item.generateTransition(options);
//   },

//   appendTransitionWithTracks(transition) {
//     return this.insertTransitionAtWithTracks(this.get('length'), transition);
//   },

//   // TODO(TRANSITION): this will break when transitions conflict
//   // TODO: update for mixes too
//   insertTransitionAtWithTracks(index, transition) {
//     return Ember.RSVP.all([this.get('readyPromise'), transition.get('readyPromise')]).then(() => {
//       let item = this.getOrCreateAt(index);
//       let nextItem = this.getOrCreateAt(index + 1);

//       let expectedFromTrack = transition.get('fromTrack.content');
//       let expectedToTrack = transition.get('toTrack.content');

//       let actualFromTrack = item.get('model.content');
//       let actualToTrack = nextItem.get('model.content');

//       let fromTrackPromise, toTrackPromise, transitionPromise;
//       // insert fromTrack if not already present
//       if (!actualFromTrack || actualFromTrack !== expectedFromTrack) {
//         fromTrackPromise = item.setModel(expectedFromTrack);
//       }

//       // insert toTrack if not already present
//       if (!actualToTrack || actualToTrack !== expectedToTrack) {
//         toTrackPromise = nextItem.setModel(expectedToTrack);
//       }

//       // insert transition
//       transitionPromise = item.setTransition(transition);

//       return Ember.RSVP.all([fromTrackPromise, toTrackPromise, transitionPromise]);
//     });
//   },
// });
