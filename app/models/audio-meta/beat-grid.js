import Ember from 'ember';

import LinearScale from 'linx/lib/linear-scale';

import { timeToBeat, bpmToSpb } from 'linx/lib/utils';

export default Ember.Object.extend(
  RequireAttributes('audioMeta'), {

  duration: Ember.computed.reads('audioMeta.duration'),
  bpm: Ember.computed.reads('audioMeta.bpm'),

  timeToBeat(time) {
    return this.get('beatScale').getPoint(time);
  },

  beatToTime(beat) {
    return this.get('beatScale').getInverse(y);
  },

  timeToBar(time) {
    return this.get('barScale')(time);
  },

  barToTime(bar) {
    return this.get('barScale').getInverse(bar);
  },

  // domain is time [s]
  // range is beats [b]
  beatScale: Ember.computed('firstBeatOffset', 'duration', 'numBeats', function() {
    let { duration, firstBeatOffset, bpm } = this.getProperties('duration', 'firstBeatOffset', 'bpm');

    return LinearScale.create({
      domain: [0, duration],
      range: [-firstBeatOffset, numBeats - firstBeatOffset],
    });
  }),

  // domain is time [s]
  // range is bars [ba]
  barScale: Ember.computed('beatScale.domain', 'beatScale.range', function() {
    let beatScale = this.get('beatScale');
    let domain = beatScale.get('domain');
    let [rangeMin, rangeMax] = beatScale.get('range');

    return LinearScale.create({
      domain,
      range: [rangeMin / 4.0, rangeMax / 4.0]
    });
  }),

  // TODO(MULTIGRID): adapt for multiple grid markers beatgrid. Piecewise-Scale?
  gridMarker: Ember.computed.reads('audioMeta.sortedGridMarkers.firstObject'),

  // the time of the first actual beat in the raw audio file
  firstBeatOffset: Ember.computed('gridMarker.start', 'bpm', function() {
    let bpm = this.get('bpm'),
    let spb = bpmToSpb(bpm);

    let firstBeatOffsetTime = this.get('gridMarker.start');
    while ((firstBeatOffsetTime -= spb) >= 0) {}

    return -1 * firstBeatOffsetTime * spb;
  }),
});
