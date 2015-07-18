import DS from 'ember-data';
import { timeToBeat } from 'linx/lib/utils';

export const BEAT_MARKER_TYPE = 'beat';
export const BAR_MARKER_TYPE = 'bar';
export const SECTION_MARKER_TYPE = 'section';

export const MARKER_TYPES = [
  BEAT_MARKER_TYPE,
  BAR_MARKER_TYPE,
  SECTION_MARKER_TYPE,
];

// Base marker model
export default DS.Model.extend({
  type: DS.attr('string'), // one of MARKER_TYPES
  start: DS.attr('number'), // [s] timestamp in the track audio

  track: DS.belongsTo('track'),

  // params
  startBeat: function() {
    return timeToBeat(this.get('start'), this.get('track.bpm'));
  }.property('track.bpm', 'start'),
});
