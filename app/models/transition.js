import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from 'linx/mixins/readiness';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many/item';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import { isNumber } from 'linx/lib/utils';
import {
  TRANSITION_IN_MARKER_TYPE,
  TRANSITION_OUT_MARKER_TYPE,
} from './track/audio-meta/marker';

export default DS.Model.extend(
  DependentRelationshipMixin('fromTrackMarker'),
  DependentRelationshipMixin('toTrackMarker'),
  DependentRelationshipMixin('arrangement'),
  ReadinessMixin('isTransitionReady'), {

  title: DS.attr('string'),

  mixItems: DS.hasMany('mix/item', { async: true }),
  fromTrack: DS.belongsTo('track', { async: true }),
  toTrack: DS.belongsTo('track', { async: true }),

  isTransitionReady: Ember.computed.and('fromTrack.isReady', 'toTrack.isReady'),
  numBeats: Ember.computed.reads('arrangement.numBeats'),

  // the transition's arrangement
  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    // TODO: have to fake title for Firebase to accept record
    let arrangement = this.get('store').createRecord('arrangement', {
      title: 'test title'
    });
    return arrangement;
  }),

  // TODO(REFACTOR): instead of withDefaultModel for these, define them as normal relationships.
  // then provide methods setFromTrack, setToTrack which call setFromTrackMarker, setToTrackMarker
  // that solves the below TODO's
  // TODO: what if tracks are switched out after the transition has been made?
  // TODO: what if tracks are not present when transition is made?
  _fromTrackMarker: DS.belongsTo('track/audio-meta/marker', { async: true }),
  fromTrackMarker: withDefaultModel('_fromTrackMarker', function() {
    return this.get('fromTrack.audioMeta').then((audioMeta) => {
      return audioMeta && audioMeta.createMarker({
        audioMeta,
        type: TRANSITION_OUT_MARKER_TYPE,
      });
    });
  }),

  _toTrackMarker: DS.belongsTo('track/audio-meta/marker', { async: true }),
  toTrackMarker: withDefaultModel('_toTrackMarker', function() {
    return this.get('toTrack.audioMeta').then((audioMeta) => {
      return audioMeta && audioMeta.createMarker({
        audioMeta,
        type: TRANSITION_IN_MARKER_TYPE,
      });
    });
  }),

  fromTrackEndBeat: Ember.computed.alias('fromTrackMarker.startBeat'),
  toTrackStartBeat: Ember.computed.alias('toTrackMarker.startBeat'),
  fromTrackEnd: Ember.computed.alias('fromTrackMarker.start'),
  toTrackStart: Ember.computed.alias('toTrackMarker.start'),

  // TODO(TRANSITION): fix this
  setTransitionNumBeats(numBeats) {
    this.get('arrangement.clips.lastObject').set('numBeats', numBeats);
  },

  // create partial mix with fromTrack, transition, toTrack
  generateMix() {
    return DS.PromiseObject.create({
      promise: this.get('readyPromise').then(() => {
        let mix = this.get('store').createRecord('mix');
        mix.appendTransition(this);
        return mix;
      }),
    });
  },
});
