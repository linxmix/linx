import DS from 'ember-data';
import { timeToBeat } from 'linx/lib/utils';

export const BEAT_MARKER_TYPE = 'beat';
export const BAR_MARKER_TYPE = 'bar';
export const SECTION_MARKER_TYPE = 'section';
export const FADE_IN_MARKER_TYPE = 'fade-in';
export const FADE_OUT_MARKER_TYPE = 'fade-out';

export const USER_MARKER_TYPE = 'user';
export const TRANSITION_IN_MARKER_TYPE = 'transition-in';
export const TRANSITION_OUT_MARKER_TYPE = 'transition-out';

// Base marker model
export default DS.Model.extend({
  type: DS.attr('string'), // one of MARKER_TYPES
  start: DS.attr('number'), // [s] timestamp in audio

  audioMeta: DS.belongsTo('audio-meta', { async: true }),

  // params
  startBeat: function() {
    return timeToBeat(this.get('start'), this.get('audioMeta.bpm'));
  }.property('audioMeta.bpm', 'start'),
});
