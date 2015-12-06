import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';

export default DS.Model.extend(
  PlayableArrangementMixin,
  OrderedHasManyMixin('_mixItems', 'mix/item'), {

  title: DS.attr('string'),
  timeSignature: DS.attr('number', { defaultValue: 4.0 }),
  _mixItems: DS.hasMany('mix/item', { async: true }),

  // implement playable-arrangement
  session: Ember.inject.service(),
  audioContext: Ember.computed.reads('session.audioContext'),

  fromTracks: Ember.computed.mapBy('items', 'fromTrack.content'),
  toTracks: Ember.computed.mapBy('items', 'toTrack.content'),
  tracks: Ember.computed.uniq('fromTracks', 'toTracks'),
  transitions: Ember.computed.mapBy('items', 'transition'),

  fromTrackClips: Ember.computed.mapBy('items', 'fromTrackClip'),
  toTrackClips: Ember.computed.mapBy('items', 'toTrackClip'),

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
    return this.createAt(index, { _transition: transition });
  },

  insertTransitionsAt(index, transitions) {
    let items = transitions.map((transition) => {
      return this.createItem({ _transition: transition });
    });

    return this.replace(index, 0, items);
  },

  appendTransitions(transitions) {
    return this.insertTransitionsAt(this.get('length'), transitions);
  },

  // TODO(REFACTOR): these need to change
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
