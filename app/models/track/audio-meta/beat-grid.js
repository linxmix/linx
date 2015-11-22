import Ember from 'ember';

import LinearScale from 'linx/lib/linear-scale';
import RequireAttributes from 'linx/lib/require-attributes';

import { timeToBeat as timeToBeatUtil, bpmToSpb, isNumber } from 'linx/lib/utils';

export const BAR_QUANTIZATION = 'bar';
export const BEAT_QUANTIZATION = 'beat';
export const TICK_QUANTIZATION = 'tick';
export const MS10_QUANTIZATION = '10ms';
export const MS1_QUANTIZATION = '1ms';
export const SAMPLE_QUANTIZATION = 'sample';

export const TICKS_PER_BEAT = 120;

export default Ember.Object.extend(
  RequireAttributes('audioMeta'), {

  duration: Ember.computed.reads('audioMeta.duration'),
  bpm: Ember.computed.reads('audioMeta.bpm'),
  timeSignature: Ember.computed.reads('audioMeta.timeSignature'),

  timeToBeat(time) {
    return this.get('beatScale').getPoint(time);
  },

  beatToTime(beat) {
    return this.get('beatScale').getInverse(beat);
  },

  beatToBar(beat) {
    return beat / this.get('timeSignature');
  },

  barToBeat(bar) {
    return bar * this.get('timeSignature');
  },

  timeToBar(time) {
    return this.get('barScale').getPoint(time);
  },

  barToTime(bar) {
    return this.get('barScale').getInverse(bar);
  },

  getQuantizedBar(bar, quantization) {
    let beat = this.barToBeat(bar);
    let quantizedBeat = this.getQuantizedBeat(beat, quantization);
    return this.beatToBar(quantizedBeat);
  },

  getQuantizedBeat(beat, quantization) {
    switch (quantization) {
      case BAR_QUANTIZATION:
        return this.barToBeat(Math.round(this.beatToBar(beat)));
      case BEAT_QUANTIZATION:
        return Math.round(beat);
      // TODO(QUANTIZATION)
      default:
        return beat;
    }
  },

  getQuantizedTime(time, quantization) {
    let beat = this.timeToBeat(time);
    let quantizedBeat = this.getQuantizedBeat(beat, quantization);
    return this.beatToTime(quantizedBeat);
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
  barScale: Ember.computed('beatScale.domain', 'beatScale.range', 'timeSignature', function() {
    let timeSignature = this.get('timeSignature');
    let beatScale = this.get('beatScale');
    let domain = beatScale.get('domain');
    let [rangeMin, rangeMax] = beatScale.get('range');

    return LinearScale.create({
      domain,
      range: [rangeMin / timeSignature, rangeMax / timeSignature]
    });
  }).readOnly(),

  // TODO(MULTIGRID): adapt for multiple grid markers. Piecewise-Scale? or a long domain/range?
  gridMarker: Ember.computed.reads('audioMeta.sortedGridMarkers.firstObject'),

  nudge(value) {
    Ember.assert('Cannot nudge BeatGrid without numeric value', isNumber(value));

    let gridMarker = this.get('gridMarker');
    gridMarker.set('start', gridMarker.get('start') + value);
  },

  // TODO(MULTIGRID): this will depend on the grid markers and bpm
  numBeats: Ember.computed('duration', 'bpm', function() {
    return timeToBeatUtil(this.get('duration'), this.get('bpm'));
  }),

  // the time of the first actual beat in the raw audio file
  // TODO(MULTIGRID): this supposes a constant bpm in the audio file
  firstBarOffset: Ember.computed('gridMarker.start', 'bpm', 'timeSignature', function() {
    let bpm = this.get('bpm');
    let timeSignature = this.get('timeSignature');
    let secondsPerBeat = bpmToSpb(bpm);
    let secondsPerBar = secondsPerBeat * timeSignature;

    let firstBarOffsetTime = this.get('gridMarker.start');
    while ((firstBarOffsetTime - secondsPerBar) >= 0) {
      firstBarOffsetTime -= secondsPerBar;
    }

    return firstBarOffsetTime * secondsPerBar;
  }),
});

// provides dynamically updating beat grid properties
// supports constants and paths
function beatGridPropertyGenerator(beatGridFunctionName) {
  return function(beatGridPath, unitOrPath) {
    let isPath = !isNumber(unitOrPath);

    if (isPath) {
      let unitPath = unitOrPath;

      return Ember.computed(`${beatGridPath}.beatScale`, unitPath, function() {
        let unit = this.get(unitPath);
        let beatGrid = this.get(beatGridPath);

        return beatGrid && beatGrid[beatGridFunctionName](unit);
      });
    } else {
      let unit = unitOrPath;

      return Ember.computed(`${beatGridPath}.beatScale`, function() {
        let beatGrid = this.get(beatGridPath);

        return beatGrid && beatGrid[beatGridFunctionName](unit);
      });
    }
  };
}

export const beatToTime = beatGridPropertyGenerator('beatToTime');
export const timeToBeat = beatGridPropertyGenerator('timeToBeat');

export const barToTime = beatGridPropertyGenerator('barToTime');
export const timeToBar = beatGridPropertyGenerator('timeToBar');
