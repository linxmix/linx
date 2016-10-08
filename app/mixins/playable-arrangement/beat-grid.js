import Ember from 'ember';
import d3 from 'd3';

import LinearScale from 'linx/lib/linear-scale';
import QuantizeScale from 'linx/lib/quantize-scale';
import computedObject from 'linx/lib/computed/object';
import { timeToBeatUtil, bpmToSpb, isValidNumber } from 'linx/lib/utils';

export const BAR_QUANTIZATION = 'bar';
export const BEAT_QUANTIZATION = 'beat';
export const TICK_QUANTIZATION = 'tick';
export const MS10_QUANTIZATION = '10ms';
export const MS1_QUANTIZATION = '1ms';
export const SAMPLE_QUANTIZATION = 'sample';

export const TICKS_PER_BEAT = 120;


export default Ember.Object.extend({

  // required params
  bpmScale: null,
  beatCount: null,

  // optional params
  timeSignature: 4,

  timeToBeat(time) {
    return this.get('beatScale')(time);
  },

  beatToTime(beat) {
    return this.get('beatScale').invert(beat);
  },

  beatToBar(beat) {
    return beat / this.get('timeSignature');
  },

  barToBeat(bar) {
    return bar * this.get('timeSignature');
  },

  timeToBar(time) {
    return this.get('barScale')(time);
  },

  barToTime(bar) {
    return this.get('barScale').invert(bar);
  },

  quantizeBeat(beat) {
    return this.get('quantizeBeatScale')(beat);
  },

  quantizeBar(bar) {
    return this.get('quantizeBarScale')(bar);
  },

  beatToQuantizedBar(beat) {
    return this.quantizeBar(this.beatToBar(beat));
  },

  beatToQuantizedDownbeat(beat) {
    // console.log('beatToQuantizedDownbeat', {
    //   beat,
    //   bar: this.beatToBar(beat),
    //   quantizedBar: this.beatToQuantizedBar(beat),
    //   quantizedBeat: this.barToBeat(this.beatToQuantizedBar(beat)),
    // });
    return this.barToBeat(this.beatToQuantizedBar(beat));
  },

  timeToQuantizedBeat(time) {
    return this.quantizeBeat(this.timeToBeat(time));
  },

  timeToQuantizedBar(time) {
    return this.quantizeBar(this.timeToBar(time));
  },

  duration: Ember.computed('beatScale', 'beatCount', function() {
    return this.beatToTime(this.get('beatCount'));
  }),

  // returns time duration of given beat interval
  getDuration(startBeat, endBeat) {
    const startTime = this.beatToTime(startBeat);
    const endTime = this.beatToTime(endBeat);
    return endTime - startTime;
  },

  // returns beat count of given time interval
  getBeatCount(startTime, endTime) {
    const startBeat = this.timeToBeat(startTime);
    const endBeat = this.timeToBeat(endTime);
    return endBeat - startBeat;
  },

  // Beat Scale
  // domain is time [s]
  // range is beats [b]
  beatScaleDomain: Ember.computed('bpmScale', function() {
    const { bpmScale } = this.getProperties('beatCount', 'bpmScale');

    // add durations from each linear interval
    const domain = bpmScale.domain();
    return domain.reduce((range, endBeat, i) => {
      if (i === 0) {
        range.push(0);
        return range;
      }

      const prevDuration = range[i - 1];

      const startBeat = domain[i - 1];
      const startBpm = bpmScale(startBeat);
      const endBpm = bpmScale(endBeat);

      const intervalBeatCount = endBeat - startBeat;
      const averageBpm = (endBpm + startBpm) / 2.0;
      const minutes = intervalBeatCount / averageBpm;
      const seconds = minutes * 60;

      console.log('calculate seconds', {
        startBeat,
        endBeat,
        startBpm,
        endBpm,
        intervalBeatCount,
        averageBpm,
        minutes,
        seconds,
        prevDuration
      });

      if (isValidNumber(seconds)) {
        range.push(prevDuration + seconds);
      } else {
        range.push(prevDuration);
      }

      return range;
    }, []);
  }),
  beatScaleRange: Ember.computed('bpmScale', function() {
    return this.get('bpmScale').domain();
  }),
  beatScale: Ember.computed('beatScaleDomain', 'beatScaleRange', function() {
    return d3.scale.linear()
      .domain(this.get('beatScaleDomain') || [])
      .range(this.get('beatScaleRange') || []);
  }),
  quantizeBeatScale: Ember.computed('beatScale', function() {
    const beatScale = this.get('beatScale');

    return d3.scale.linear()
      .domain(beatScale.range())
      .rangeRound(beatScale.range().map(Math.round));
  }),

  // Bar Scale
  // domain is time [s]
  // range is beats [b]
  barScaleRange: Ember.computed('beatScaleRange', 'timeSignature', function() {
    const { beatScale, timeSignature } = this.getProperties('beatScale', 'timeSignature');

    return beatScale.range().map((n) => n / timeSignature);
  }),
  barScale: Ember.computed('beatScaleDomain', 'barScaleRange', function() {
    return d3.scale.linear()
      .domain(this.get('beatScaleDomain') || [])
      .range(this.get('barScaleRange') || []);
  }),
  quantizeBarScale: Ember.computed('barScale', function() {
    const barScale = this.get('barScale');

    return d3.scale.linear()
      .domain(barScale.range())
      .rangeRound(barScale.range().map(Math.round));
  }),

  toString() {
    return '<linx@object:mixin/playable-arrangement/beat-grid>';
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

