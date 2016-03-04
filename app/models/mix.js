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

  tracks: Ember.computed.mapBy('items', 'track.content'),
  transitions: Ember.computed.mapBy('items', 'transition.content'),

  trackClips: Ember.computed.mapBy('items', 'trackClip'),
  transitionClips: Ember.computed.mapBy('items', 'transitionClip'),
  clips: Ember.computed.uniq('trackClips', 'transitionClips'),

  trackAt(index) {
    let item = this.objectAt(index);
    return item && item.get('track.content');
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

  generateTransitionAt(index, options) {
    let item = this.getOrCreateAt(index);

    return item.optimizeTransition(options);
  },

  generateTransitionAndAppend(options) {
    return this.generateTransitionAt(this.get('length'), options);
  },
});
