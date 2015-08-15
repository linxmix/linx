import Ember from 'ember';
import DS from 'ember-data';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import { isNumber } from 'linx/lib/utils';
import {
  TRANSITION_IN_MARKER_TYPE,
  TRANSITION_OUT_MARKER_TYPE,
} from './marker';

export default DS.Model.extend({
  title: DS.attr('string'),
  numBeats: DS.attr('number'),

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

  fromTrackEndBeat: Ember.computed.alias('fromTrackMarker.startBeat'),
  toTrackStartBeat: Ember.computed.alias('toTrackMarker.startBeat'),

  template: DS.belongsTo('transition-template', { async: true }),

  fromTrack: DS.belongsTo('track', { async: true }),
  toTrack: DS.belongsTo('track', { async: true }),

  // sets fromTrackMarker to given time in fromTrack
  setStart: function(time) {
    Ember.assert('Transition.setStart requires a valid number', isNumber(time));

    var marker = this.get('fromTrackMarker');
    marker.set('start', time);
    return marker.save();
  },

  // sets toTrackMarker to given time in toTrack
  setEnd: function(time) {
    Ember.assert('Transition.setEnd requires a valid number', isNumber(time));

    var marker = this.get('toTrackMarker');
    marker.set('end', time);
    return marker.save();
  },
});
