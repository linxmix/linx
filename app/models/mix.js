import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';

export default DS.Model.extend(
  PlayableArrangementMixin,
  OrderedHasManyMixin('_transitions', 'transition'), {

  trackClips: Ember.computed.mapBy('transitions', 'fromTrackClip'),
  transitionClips: Ember.computed.mapBy('transitions', 'transitionClip'),
  clips: Ember.computed.uniq('trackClips', 'transitionClips'),

  title: DS.attr('string'),
  _transitions: DS.hasMany('transitions', { async: true }),
});

//   // TODO: what of the rest is necessary?
//   _arrangement: DS.belongsTo('arrangement', { async: true }),
//   arrangement: withDefaultModel('_arrangement', function() {
//     let arrangement = this.get('store').createRecord('arrangement');
//     return arrangement;
//   }),

//   models: Ember.computed.mapBy('items', 'model'),
//   transitions: Ember.computed.mapBy('items', 'transition'),

//   modelAt(index) {
//     return this.objectAt(index).get('model.content');
//   },

//   transitionAt(index) {
//     return this.objectAt(index).get('transition.content');
//   },

//   insertModelAt(index, model) {
//     let item = this.createAt(index);

//     return item.setModel(model).then(() => {
//       return item;
//     });
//   },

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

//   // implement readiness mixin
//   isMixReady: Ember.computed.bool('arrangement.content'),

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
