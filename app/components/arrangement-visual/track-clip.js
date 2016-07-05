import Ember from 'ember';

import { join } from 'ember-cli-d3/utils/d3';

import Clip from './clip';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { timeToBeat as staticTimeToBeat } from 'linx/lib/utils';
import multiply from 'linx/lib/computed/multiply';
import { translate } from 'linx/helpers/svg-translate';

export default Clip.extend(
  GraphicSupport('displayWaveform', 'displayOverflowWaveform', 'waveColor', 'isLoadingAudio', 'isAudioEmpty', 'trackBeatCount', 'audioStartTime', 'audioEndTime', 'trackBpm'), {

  // optional params
  displayWaveform: true,
  displayOverflowWaveform: false,
  waveColor: 'green',
  selectedQuantization: null,
  isLoadingAudio: Ember.computed.reads('audioBinary.isLoading'),
  isAudioEmpty: Ember.computed.reads('audioBinary.isEmpty'),

  call(selection) {
    this._super.apply(this, arguments);
    selection
      .classed('ArrangementVisualTrackClip', true)
      .classed('is-loading', this.get('isLoadingAudio'))
      .classed('is-empty', this.get('isAudioEmpty'));

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
  trackPeaksDidChange: Ember.observer('audioBinary', 'audioBuffer', 'pxPerBeat', 'trackBeatCount', 'trackDuration', 'audioStartTime', 'audioEndTime', 'displayOverflowWaveform', function() {
    Ember.run.once(this, 'updateTrackPeaks');
  }).on('didInsertElement'),

  updateTrackPeaks() {
    const { audioBinary, audioBuffer, peaksLength, trackDuration, audioStartTime, audioEndTime, displayOverflowWaveform } = this.getProperties('audioBinary', 'audioBuffer', 'peaksLength', 'trackDuration', 'audioStartTime', 'audioEndTime', 'displayOverflowWaveform');

    // Ember.Logger.log('track clip peaks', { audioBinary, audioBuffer, peaksLength, trackDuration, audioStartTime, audioEndTime, displayOverflowWaveform });

    audioBinary && audioBinary.getPeaks({
      startTime: displayOverflowWaveform ? 0 : audioStartTime,
      endTime: displayOverflowWaveform ? trackDuration : audioEndTime,
      length: peaksLength,

    // scale peaks to track-clip
    }).then((peaks) => {
      peaks = peaks.map((peak, i) => {
        const percent = i / peaksLength;
        const beat = percent * peaksLength;
        return [beat, peak];
      });

      if (!this.get('isDestroyed')) {
        this.set('trackPeaks', peaks || []);
      }
    }, (error) => {
      console.log("Error with trackClip.updateTrackPeaks", error);
    });
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

  // TODO(TECHDEBT): move to sub components
  startOverlay: join([0], 'rect.ArrangementVisualTrackClip-startOverlay', {
    update(selection) {
      selection
        .style('visibility', this.get('displayOverflowWaveform') ? 'visible' : 'hidden')
        .attr('height', this.get('height'))
        .attr('width', this.get('startOffsetWidth'))
        .attr('transform', this.get('startOffsetTransform'))
        .on('click', () => this.send('onClick'));
    },
  }),

  endOverlay: join([0], 'rect.ArrangementVisualTrackClip-endOverlay', {
    update(selection) {
      selection
        .style('visibility', this.get('displayOverflowWaveform') ? 'visible' : 'hidden')
        .attr('height', this.get('height'))
        .attr('width', this.get('endOffsetWidth'))
        .attr('transform', this.get('endOffsetTransform'))
        .on('click', () => this.send('onClick'));
    },
  }),
});
