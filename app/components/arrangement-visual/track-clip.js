import Ember from 'ember';

import { join } from 'ember-cli-d3/utils/d3';

import Clip from './clip';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { timeToBeat as staticTimeToBeat } from 'linx/lib/utils';
import multiply from 'linx/lib/computed/multiply';
import { translate } from 'linx/helpers/svg-translate';

export default Clip.extend(
  GraphicSupport('displayWaveform', 'waveColor', 'isLoadingAudio', 'trackBeatCount', 'audioStartTime', 'audioEndTime'), {

  // optional params
  displayWaveform: true,
  waveColor: 'green',
  selectedQuantization: null,
  isLoadingAudio: Ember.computed.reads('audioBinary.isLoading'),

  call(selection) {
    this._super.apply(this, arguments);
    selection
      .classed('ArrangementVisualTrackClip', true)
      .classed('is-loading', this.get('isLoadingAudio'));

    this.startOverlay(selection);
    this.endOverlay(selection);
  },

  track: Ember.computed.reads('clip.track'),
  audioStartTime: Ember.computed.reads('clip.audioStartTime'),
  audioEndTime: Ember.computed.reads('clip.audioEndTime'),
  audioMeta: Ember.computed.reads('track.audioMeta'),
  trackBpm: Ember.computed.reads('audioMeta.bpm'),
  trackBeatCount: Ember.computed.reads('audioMeta.beatCount'),
  trackDuration: Ember.computed.reads('audioMeta.duration'),
  audioBinary: Ember.computed.reads('track.audioBinary'),
  audioBuffer: Ember.computed.reads('audioBinary.audioBuffer'),

  peaksLength: multiply('trackBeatCount', 'pxPerBeat'),
  trackPeaks: [],

  // TODO(CLEANUP): shouldnt have to depend on audioBuffer
  trackPeaksDidChange: Ember.observer('audioBinary', 'audioBuffer', 'pxPerBeat', 'trackBeatCount', 'trackDuration',function() {
    Ember.run.once(this, 'updateTrackPeaks');
  }).on('didInsertElement'),

  updateTrackPeaks() {
    const { audioBinary, audioBuffer, peaksLength, trackDuration } = this.getProperties('audioBinary', 'audioBuffer', 'peaksLength', 'trackDuration');

    // Ember.Logger.log('track clip peaks', this.getProperties('audioBinary', 'audioBuffer', 'pxPerBeat', 'trackBeatCount', 'trackDuration'));
    const peaks = audioBinary && audioBinary.getPeaks({
      startTime: 0,
      endTime: trackDuration,
      length: peaksLength,

    // scale peaks to track-clip
    }).map((peak, i) => {
      const percent = i / peaksLength;
      const beat = percent * peaksLength;
      return [beat, peak];
    });

    this.set('trackPeaks', peaks || []);
  },

  // calculate actual raw audio time offset for waveform and overlays
  startOffsetBeats: Ember.computed('audioStartTime', 'trackBpm', function() {
    return staticTimeToBeat(this.get('audioStartTime'), this.get('trackBpm'));
  }),
  startOffsetPx: multiply('startOffsetBeats', 'pxPerBeat'),
  startOffsetWidth: Ember.computed.reads('startOffsetPx'),
  startOffsetTransform: Ember.computed('startOffsetPx', function() {
    return translate([-this.get('startOffsetPx')]);
  }),

  endOffsetBeats: Ember.computed('audioStartTime', 'audioEndTime', 'trackBpm', function() {
    return staticTimeToBeat(this.get('audioEndTime') - this.get('audioStartTime'), this.get('trackBpm'));
  }),
  endOffsetPx: multiply('endOffsetBeats', 'pxPerBeat'),
  endOffsetWidth: Ember.computed('endOffsetBeats', 'trackBeatCount', 'pxPerBeat', function() {
    return (this.get('trackBeatCount') - this.get('endOffsetBeats')) * this.get('pxPerBeat');
  }),
  endOffsetTransform: Ember.computed('endOffsetPx', function() {
    return translate([this.get('endOffsetPx')]);
  }),

  startOverlay: join([0], 'rect.ArrangementVisualTrackClip-startOverlay', {
    update(selection) {
      selection
        .attr('height', this.get('height'))
        .attr('width', this.get('startOffsetWidth'))
        .attr('transform', this.get('startOffsetTransform'))
        .on('click', () => this.send('onClick'));
    },
  }),

  endOverlay: join([0], 'rect.ArrangementVisualTrackClip-endOverlay', {
    update(selection) {
      selection
        .attr('height', this.get('height'))
        .attr('width', this.get('endOffsetWidth'))
        .attr('transform', this.get('endOffsetTransform'))
        .on('click', () => this.send('onClick'));
    },
  }),
});
