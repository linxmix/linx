import Ember from 'ember';

import LinearScale from 'linx/lib/linear-scale';
import RequireAttributes from 'linx/lib/require-attributes';

import { bpmToSpb } from 'linx/lib/utils';

export default Ember.Object.extend(
  RequireAttributes('audioMeta'), {

  duration: Ember.computed.reads('audioMeta.duration'),
  bpm: Ember.computed.reads('audioMeta.bpm'),
  numBeats: Ember.computed.reads('audioMeta.numBeats'),

  timeToBeat(time) {
    return this.get('beatScale').getPoint(time);
  },

  beatToTime(beat) {
    return this.get('beatScale').getInverse(y);
  },

  timeToBar(time) {
    return this.get('barScale').getPoint(time);
  },

  barToTime(bar) {
    return this.get('barScale').getInverse(bar);
  },

  // domain is time [s]
  // range is beats [b]
  beatScale: Ember.computed('firstBarOffset', 'duration', 'numBeats', function() {
    let { duration, firstBarOffset, bpm } = this.getProperties('duration', 'firstBarOffset', 'bpm');

    return LinearScale.create({
      domain: [0, duration],
      range: [-firstBarOffset, this.get('numBeats') - firstBarOffset],
    });
  }).readOnly(),

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
  }).readOnly(),

  // TODO(MULTIGRID): adapt for multiple grid markers. Piecewise-Scale? or a long domain/range?
  gridMarker: Ember.computed.reads('audioMeta.sortedGridMarkers.firstObject'),

  // the time of the first actual beat in the raw audio file
  firstBarOffset: Ember.computed('gridMarker.start', 'bpm', function() {
    let bpm = this.get('bpm');
    let secondsPerBeat = bpmToSpb(bpm);
    let secondsPerBar = secondsPerBeat * 4.0;

    let firstBarOffsetTime = this.get('gridMarker.start');
    while ((firstBarOffsetTime - secondsPerBar) >= 0) {
      firstBarOffsetTime -= secondsPerBar;
    }

    return firstBarOffsetTime * secondsPerBar;
  }),
});

//
// convenience computed properties
//

// provides dynamically updating time of the beat at given beatPath
export function beatToTime(beatGridPath, beatPath) {
  return Ember.computed(`${beatGridPath}.beatScale`, beatPath, function() {
    let beat = this.get('beatPath');

    return this.get('beatGridPath').beatToTime(beat);
  });
};

// provides dynamically updating beat of the time at given timePath
export function timeToBeat(beatGridPath, timePath) {
  return Ember.computed(`${beatGridPath}.beatScale`, timePath, function() {
    let time = this.get('timePath');

    return this.get('beatGridPath').timeToBeat(time);
  });
};

// provides dynamically updating time of the beat at given beatPath
export function barToTime(beatGridPath, barPath) {
  return Ember.computed(`${beatGridPath}.barScale`, barPath, function() {
    let bar = this.get('barPath');

    return this.get('beatGridPath').barToTime(bar);
  });
};

// provides dynamically updating bar of the time at given timePath
export function barToTime(beatGridPath, timePath) {
  return Ember.computed(`${beatGridPath}.barScale`, timePath, function() {
    let time = this.get('timePath');

    return this.get('beatGridPath').timeToBar(time);
  });
};
