import Ember from 'ember';
import DS from 'ember-data';

import makeTrack from './make-track';

import {
  TRANSITION_IN_MARKER_TYPE,
  TRANSITION_OUT_MARKER_TYPE,
} from 'linx/models/marker';


// creates transition with specifications
export default function(options = {}) {
  var fromTrackEnd = Ember.getWithDefault(options, 'fromTrackEnd', 100);
  var toTrackStart = Ember.getWithDefault(options, 'toTrackStart', 50);
  var numBeats = Ember.getWithDefault(options, 'numBeats', 20);

  var fromTrack = Ember.getWithDefault(options, 'fromTrack', makeTrack.call(this));
  var toTrack = Ember.getWithDefault(options, 'toTrack', makeTrack.call(this));

  var fromTrackMarker = this.factory.make('marker', {
    type: TRANSITION_OUT_MARKER_TYPE,
    audioMeta: fromTrack.get('audioMeta.content'),
    start: fromTrackEnd,
  });

  var toTrackMarker = this.factory.make('marker', {
    type: TRANSITION_IN_MARKER_TYPE,
    audioMeta: toTrack.get('audioMeta.content'),
    start: toTrackStart
  });

  var transition = this.factory.make('transition', {
    _fromTrackMarker: fromTrackMarker,
    _toTrackMarker: toTrackMarker,
    fromTrack,
    toTrack,
    numBeats
  });

  // make withDefaultModel think transition has markers
  transition.set('_data', {
    _fromTrackMarker: 1,
    _toTrackMarker: 2
  });

  return {
    fromTrack,
    toTrack,
    transition
  };
}
