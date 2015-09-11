import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from 'linx/mixins/readiness';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import { isNumber } from 'linx/lib/utils';
import {
  TRANSITION_IN_MARKER_TYPE,
  TRANSITION_OUT_MARKER_TYPE,
} from './marker';

export default DS.Model.extend(
  DependentRelationshipMixin('fromTrackMarker'),
  DependentRelationshipMixin('toTrackMarker'),
  DependentRelationshipMixin('arrangement'),
  ReadinessMixin('isTransitionReady'), {

  title: DS.attr('string'),
  isTemplate: DS.attr('boolean'),

  isTransitionReady: Ember.computed.and('fromTrack.isReady', 'toTrack.isReady'),

  _fromTrackMarker: DS.belongsTo('marker', { async: true }),
  fromTrackMarker: withDefaultModel('_fromTrackMarker', function() {
    return this.get('store').createRecord('marker', {
      audioMeta: this.get('fromTrack.audioMeta'),
      type: TRANSITION_OUT_MARKER_TYPE,
    });
  }),

  _toTrackMarker: DS.belongsTo('marker', { async: true }),
  toTrackMarker: withDefaultModel('_toTrackMarker', function() {
    return this.get('store').createRecord('marker', {
      audioMeta: this.get('toTrack.audioMeta'),
      type: TRANSITION_IN_MARKER_TYPE,
    });
  }),

  fromTrackEndBeat: Ember.computed.reads('fromTrackMarker.startBeat'),
  toTrackStartBeat: Ember.computed.reads('toTrackMarker.startBeat'),

  fromTrackEnd: Ember.computed.reads('fromTrackMarker.start'),
  toTrackStart: Ember.computed.reads('toTrackMarker.start'),

  fromTrack: DS.belongsTo('track', { async: true }),
  toTrack: DS.belongsTo('track', { async: true }),

  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    let arrangement = this.get('store').createRecord('arrangement');
    return arrangement;
  }),

  numBeats: Ember.computed.reads('arrangement.numBeats'),

  // sets fromTrackMarker to given time in fromTrack
  setFromTrackEnd: function(time) {
    Ember.assert('Transition.setFromTrackEnd requires a valid number', isNumber(time));

    return this.get('fromTrackMarker').then((marker) => {
      marker.set('start', time);
      return marker;
    });
  },

  // sets toTrackMarker to given time in toTrack
  setToTrackStart: function(time) {
    Ember.assert('Transition.setToTrackStart requires a valid number', isNumber(time));

    return this.get('toTrackMarker').then((marker) => {
      marker.set('start', time);
      return marker;
    });
  },
});
