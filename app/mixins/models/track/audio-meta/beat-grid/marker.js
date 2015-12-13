import Ember from 'ember';

import {
  computedBeatToTime,
  computedTimeToBeat,
  computedTimeToBar,
  computedBarToBeat,
  computedQuantizeBeat,
  computedQuantizeBar,
} from 'linx/models/track/audio-meta/beat-grid';

// Interface for Markers on the Track BeatGrid
// Requires: beatGrid
// provides convenient properties given one of the following:
// [s]  time
// [b]  beat
// [ba] bar
export default Ember.Mixin.create({
  beatGrid: null,

  time: computedBeatToTime('beatGrid', 'beat'),

  beat: computedTimeToBeat('beatGrid', 'time'),
  quantizeBeat: computedQuantizeBeat('beatGrid', 'beat'),

  bar: computedTimeToBar('beatGrid', 'time'),
  quantizeBar: computedQuantizeBar('beatGrid', 'bar'),

  toString() {
    return '<linx@mixin:track/audio-meta/beat-grid/marker>';
  },
});
