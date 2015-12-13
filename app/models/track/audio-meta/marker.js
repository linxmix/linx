import Ember from 'ember';
import DS from 'ember-data';

import TrackTimeMarkerMixin from 'linx/mixins/models/track/audio-meta/beat-grid/time-marker';

export const GRID_MARKER_TYPE = 'grid';
export const SECTION_MARKER_TYPE = 'section';
export const FADE_IN_MARKER_TYPE = 'fade-in';
export const FADE_OUT_MARKER_TYPE = 'fade-out';

export const USER_MARKER_TYPE = 'user';
export const TRANSITION_IN_MARKER_TYPE = 'transition-in';
export const TRANSITION_OUT_MARKER_TYPE = 'transition-out';

// Base marker model
export default DS.Model.extend(
  TrackTimeMarkerMixin, {

  type: DS.attr('string'), // one of MARKER_TYPES
  time: DS.attr('number', { defaultValue: 0 }), // [s] timestamp in audio

  // confidence in this marker's accuracy. used for analysis
  confidence: DS.attr('number'),

  audioMeta: DS.belongsTo('track/audio-meta', { async: true }),
  beatGrid: Ember.computed.reads('audioMeta.beatGrid'),
});
