import Ember from 'ember';
import DS from 'ember-data';

import { timeToBeat, beatToTime, isNumber } from 'linx/lib/utils';

export const GRID_MARKER_TYPE = 'grid';
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

  // confidence in this marker's accuracy. used for analysis
  confidence: DS.attr('number'),

  fromTransitions: DS.belongsTo('transition', { async: true, inverse: '_fromTrackMarker' }),
  toTransitions: DS.belongsTo('transition', { async: true, inverse: '_toTrackMarker' }),
  audioMeta: DS.belongsTo('audio-meta', { async: true }),
  beatGrid: Ember.computed.reads('audioMeta.beatGrid'),

  startBeat: Ember.computed('beatGrid.beatScale', 'start', {
    get(key) {
      let beatGrid = this.get('beatGrid');
      return beatGrid && beatGrid.timeToBeat(this.get('start'));
    },

    set(key, beat) {
      let beatGrid = this.get('beatGrid');

      Ember.assert('Can only set marker startBeat with numeric beat', isNumber(beat));
      Ember.assert('Can only set marker startBeat with valid beatGrid', Ember.isPresent(beatGrid));

      this.set('start', beatGrid.beatToTime(beat));
      return beat;
    }
  }),

  startBar: Ember.computed('beatGrid.barScale', 'start', {
    get(key) {
      let beatGrid = this.get('beatGrid');
      return beatGrid && beatGrid.timeToBar(this.get('start'));
    },

    set(key, bar) {
      let beatGrid = this.get('beatGrid');

      Ember.assert('Can only set marker startBeat with numeric bar', isNumber(bar));
      Ember.assert('Can only set marker startBeat with valid beatGrid', Ember.isPresent(beatGrid));

      this.set('start', beatGrid.barToTime(bar));
      return bar;
    }
  }),
});
