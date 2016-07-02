import Ember from 'ember';
import d3 from 'd3';

import LinearScale from 'linx/lib/linear-scale';
import QuantizeScale from 'linx/lib/quantize-scale';
import computedObject from 'linx/lib/computed/object';
import { timeToBeat, bpmToSpb, isValidNumber } from 'linx/lib/utils';

export const BAR_QUANTIZATION = 'bar';
export const BEAT_QUANTIZATION = 'beat';
export const TICK_QUANTIZATION = 'tick';
export const MS10_QUANTIZATION = '10ms';
export const MS1_QUANTIZATION = '1ms';
export const SAMPLE_QUANTIZATION = 'sample';

export const TICKS_PER_BEAT = 120;

export default Ember.Object.extend({

  // required params
  duration: null,
  bpm: null,

  // optional params
  barGridTime: 0,
  timeSignature: 4,

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

  beatToQuantizedBar(beat) {
    return this.quantizeBar(this.beatToBar(beat));
  },

  beatToQuantizedDownbeat(beat) {
    return this.barToBeat(this.beatToQuantizedBar(beat));
  },

  timeToQuantizedBeat(time) {
    return this.quantizeBeat(this.timeToBeat(time));
  },

  timeToQuantizedBar(time) {
    return this.quantizeBar(this.timeToBar(time));
  },

  timeToQuantizedDownbeatTime(time) {
    return this.barToTime(this.timeToQuantizedBar(time));
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
    // TODO: i think below line is deprecated, and can be removed?
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
    const { beatScale, timeSignature } = this.getProperties('beatScale', 'timeSignature');
    const [rangeMin, rangeMax] = beatScale.get('range');

    return [rangeMin / timeSignature, rangeMax / timeSignature];
  }),
  barScale: computedObject(LinearScale, {
    'domain': 'beatScaleDomain',
    'range': 'barScaleRange',
  }),
  quantizeBarScaleRange: Ember.computed('barScaleRange', function() {
    const barScale = this.get('barScale');
    const [rangeMin, rangeMax] = barScale.get('range');
    // TODO: i think below line is deprecated, and can be removed?
    // return d3.range(Math.ceil(rangeMin), Math.floor(rangeMax), 1);
    return [Math.ceil(rangeMin), Math.floor(rangeMax)];
  }),
  quantizeBarScale: computedObject(QuantizeScale, {
    'domain': 'barScaleRange',
    'range': 'quantizeBarScaleRange',
  }),

  // TODO(MULTIGRID): this will depend on the grid markers and bpm
  beatCount: Ember.computed('duration', 'bpm', function() {
    return timeToBeat(this.get('duration'), this.get('bpm'));
  }),

  // the time of the first actual bar in the raw audio file
  // TODO(MULTIGRID): this supposes a constant bpm in the audio file
  firstBarOffset: Ember.computed('barGridTime', 'bpm', 'timeSignature', function() {
    const bpm = this.get('bpm');
    const timeSignature = this.get('timeSignature');
    const secondsPerBeat = bpmToSpb(bpm);
    const secondsPerBar = secondsPerBeat * timeSignature;

    console.log('calculating firstBarOffset')

    let firstBarOffsetTime = this.get('barGridTime');
    console.log('barGridTime', firstBarOffsetTime)
    if (isValidNumber(bpm) && isValidNumber(timeSignature) && isValidNumber(firstBarOffsetTime)) {
      while ((firstBarOffsetTime - secondsPerBar) >= 0) {
        firstBarOffsetTime -= secondsPerBar;
      }

    console.log('firstBarOffsetTime', firstBarOffsetTime)
      return firstBarOffsetTime * secondsPerBar;
    } else {
    console.log('no firstBarOffsetTime', 0)
      return 0;
    }
  }),

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
