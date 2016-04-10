import Ember from 'ember';
import d3 from 'd3';

import LinearScale from 'linx/lib/linear-scale';
import QuantizeScale from 'linx/lib/quantize-scale';
import RequireAttributes from 'linx/lib/require-attributes';
import computedObject from 'linx/lib/computed/object';
import { timeToBeat, bpmToSpb, isValidNumber } from 'linx/lib/utils';

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

  quantizeBeat(beat) {
    return this.get('quantizeBeatScale').getPoint(beat);
  },

  quantizeBar(bar) {
    return this.get('quantizeBarScale').getPoint(bar);
  },

  // Beat Scale
  // domain is time [s]
  // range is beats [b]
  beatScaleDomain: Ember.computed('duration', function() {
    return [0, this.get('duration')];
  }),
  beatScaleRange: Ember.computed('firstBarOffset', 'beatCount', function() {
    let { firstBarOffset, beatCount } = this.getProperties('firstBarOffset', 'beatCount');
    return [-firstBarOffset, beatCount - firstBarOffset];
  }),
  beatScale: computedObject(LinearScale, {
    'domain': 'beatScaleDomain',
    'range': 'beatScaleRange',
  }),
  quantizeBeatScaleRange: Ember.computed('beatScaleRange', function() {
    let beatScale = this.get('beatScale');
    let [rangeMin, rangeMax] = beatScale.get('range');
    // return d3.range(Math.ceil(rangeMin), Math.floor(rangeMax), 1);
    return [Math.ceil(rangeMin), Math.floor(rangeMax)];
  }),
  quantizeBeatScale: computedObject(QuantizeScale, {
    'domain': 'beatScaleRange',
    'range': 'quantizeBeatScaleRange',
  }),

  // Bar Scale
  // domain is time [s]
  // range is bars [ba]
  barScaleRange: Ember.computed('beatScaleRange', 'timeSignature', function() {
    let { beatScale, timeSignature } = this.getProperties('beatScale', 'timeSignature');
    let [rangeMin, rangeMax] = beatScale.get('range');

    return [rangeMin / timeSignature, rangeMax / timeSignature];
  }),
  barScale: computedObject(LinearScale, {
    'domain': 'beatScaleDomain',
    'range': 'barScaleRange',
  }),
  quantizeBarScaleRange: Ember.computed('barScaleRange', function() {
    let barScale = this.get('barScale');
    let [rangeMin, rangeMax] = barScale.get('range');
    // return d3.range(Math.ceil(rangeMin), Math.floor(rangeMax), 1);
    return [Math.ceil(rangeMin), Math.floor(rangeMax)];
  }),
  quantizeBarScale: computedObject(QuantizeScale, {
    'domain': 'barScaleRange',
    'range': 'quantizeBarScaleRange',
  }),

  // TODO(MULTIGRID): adapt for multiple grid markers. Piecewise-Scale? or a long domain/range?
  gridMarker: Ember.computed.reads('audioMeta.sortedGridMarkers.firstObject'),

  nudge(value) {
    Ember.assert('Cannot nudge BeatGrid without numeric value', isValidNumber(value));

    let gridMarker = this.get('gridMarker');
    gridMarker.set('time', gridMarker.get('time') + value);
  },

  // TODO(MULTIGRID): this will depend on the grid markers and bpm
  beatCount: Ember.computed('duration', 'bpm', function() {
    return timeToBeat(this.get('duration'), this.get('bpm'));
  }),

  // the time of the first actual beat in the raw audio file
  // TODO(MULTIGRID): this supposes a constant bpm in the audio file
  // firstBarOffset: Ember.computed('gridMarker.time', 'bpm', 'timeSignature', function() {
  //   let bpm = this.get('bpm');
  //   let timeSignature = this.get('timeSignature');
  //   let secondsPerBeat = bpmToSpb(bpm);
  //   let secondsPerBar = secondsPerBeat * timeSignature;

  //   let firstBarOffsetTime = this.get('gridMarker.time');
  //   while ((firstBarOffsetTime - secondsPerBar) >= 0) {
  //     firstBarOffsetTime -= secondsPerBar;
  //   }

  //   return firstBarOffsetTime * secondsPerBar;
  // }),

  // TODO(MULTIGRID)
  firstBarOffset: 0,

  toString() {
    return '<linx@object:track/audio-meta/beat-grid>';
  },
});

// provides dynamically updating beat grid properties
// supports constants and paths
function beatGridPropertyGenerator(beatGridFunctionName) {
  return function(beatGridPath, unitOrPath) {
    const isPath = !isValidNumber(unitOrPath);

    const getUnit = function(context) {
      return isPath ? context.get(unitOrPath) : unitOrPath;
    }

    return Ember.computed(`${beatGridPath}.beatScale`, isPath ? unitOrPath : '', {
      get() {
        const unit = getUnit(this);
        const beatGrid = this.get(beatGridPath);

        return beatGrid && beatGrid[beatGridFunctionName](unit);
      },

      // TODO(TECHDEBT): this only works for timeToBeat
      set(key, beat) {
        // Ember.Logger.log(`set ${beatGridFunctionName}`, beat);
        Ember.assert('Must set `${beatGridFunctionName} to valid number', isValidNumber(beat));

        const beatGrid = this.get(beatGridPath);
        const time = beatGrid && beatGrid.beatToTime(beat);

        this.set(unitOrPath, time);

        return beat;
      },
    });
  };
}

// beat | time
export const computedBeatToTime = beatGridPropertyGenerator('beatToTime');
export const computedTimeToBeat = beatGridPropertyGenerator('timeToBeat');

// beat | bar
export const computedBeatToBar = beatGridPropertyGenerator('beatToBar');
export const computedBarToBeat = beatGridPropertyGenerator('barToBeat');

// bar | time
export const computedBarToTime = beatGridPropertyGenerator('barToTime');
export const computedTimeToBar = beatGridPropertyGenerator('timeToBar');

// quantize
export const computedQuantizeBeat = beatGridPropertyGenerator('quantizeBeat');
export const computedQuantizeBar = beatGridPropertyGenerator('quantizeBar');
