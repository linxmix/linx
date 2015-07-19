import DS from 'ember-data';
import { timeToBeat } from 'linx/lib/utils';

export const BEAT_MARKER_TYPE = 'beat';
export const BAR_MARKER_TYPE = 'bar';
export const SECTION_MARKER_TYPE = 'section';
export const FADE_IN_MARKER_TYPE = 'fade-in';
export const FADE_OUT_MARKER_TYPE = 'fade-out';
export const USER_MARKER_TYPE = 'user';

// Base marker model
export default DS.Model.extend({
  type: DS.attr('string'), // one of MARKER_TYPES
  start: DS.attr('number'), // [s] timestamp in the track audio

  track: DS.belongsTo('track'),

  // params
  startBeat: function() {
    return timeToBeat(this.get('start'), this.get('track.audioMeta.bpm'));
  }.property('track.audioMeta.bpm', 'start'),
});
