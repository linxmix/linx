import Ember from 'ember';
const { get } = Ember;

import Recorder from 'npm:recorderjs';
import d3 from 'd3';
import { task } from 'ember-concurrency';
import _ from 'npm:underscore';
import { EKMixin, EKOnInsertMixin, keyDown } from 'ember-keyboard';

import {
  BAR_QUANTIZATION,
  BEAT_QUANTIZATION,
  TICK_QUANTIZATION,
  MS10_QUANTIZATION,
  MS1_QUANTIZATION,
  SAMPLE_QUANTIZATION,
} from 'linx/models/track/audio-meta/beat-grid';

import { beatToTime } from 'linx/lib/utils';

export const FROM_TRACK_COLOR = '#ac6ac7';
export const TO_TRACK_COLOR = '#16a085';

export const AUTOSAVE_INTERVAL = 5000;

export default Ember.Component.extend(
  EKMixin,
  EKOnInsertMixin, {
  classNames: ['MixBuilder'],

  // required params
  mix: null,

  // optional params
  selectedTransition: null,
  selectedClip: null,

  // params
  selectedQuantizations: [BAR_QUANTIZATION],
  selectedQuantization: Ember.computed.reads('selectedQuantizations.firstObject'),
  mixVisualActionReceiver: null,
  store: Ember.inject.service(),
  sonicApi: Ember.inject.service(),

  showAutomation: true,

  _playpauseMix: Ember.on(keyDown(' '), function(e) {
    const tagName = (get(e, 'target.tagName') || '').toUpperCase();

    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
      this.send('playpause');
      e.preventDefault();
      e.stopPropagation();
    }
  }),

  _pauseMix: Ember.on('willDestroyElement', function() {
    this.get('mix').pause();
  }),

  // repeatedely save mix, if any unsaved changes
  // _autoSaveMix: Ember.on('init', function() {
  //   if (!this.get('isDestroyed')) {
  //     const mix = this.get('mix');

  //     if (mix && mix.get('anyDirty') && !mix.get('isSaving')) {
  //       console.log('Autosave Mix', this.get('mix.title'));
  //       this.get('mixSaveTask').perform();
  //     }

  //     Ember.run.later(this, '_autoSaveMix', AUTOSAVE_INTERVAL);
  //   }
  // }),

  mixSaveTask: task(function * () {
    yield this.get('mix').save();
  }).keepLatest(),

  mixExportTask: task(function * () {
    const mix = this.get('mix');
    const duration = mix.get('duration');

    const inputNode = mix.get('inputNode.content');
    const recorderNode = new Recorder(inputNode);

    mix.stop();
    recorderNode.record();
    mix.play();

    console.log('recording started', duration);
    const blob = yield new Ember.RSVP.Promise((resolve, reject) => {
      Ember.run.later(() => {
        console.log('recording stopped');
        mix.pause();
        recorderNode.stop();
        recorderNode.exportWAV(resolve);
      }, duration * 1000);
    });

    Recorder.forceDownload(blob, `${mix.get('title')}.wav`);
  }).drop(),


  actions: {
    analyzeTrack() {
      const track = this.get('mix.tracks.firstObject');
      const sonicApi = this.get('sonicApi');
      console.log('analyzeTrack', track.get('title'), track.get('audioBinary.webStreamUrl'));

      sonicApi.get('analyzeTempoTask').perform(track.get('audioBinary.webStreamUrl')).then(
        (result) => console.log('success', result),
        (error) => console.log('error', error)
      );
    },

    exportMix() {
      return this.get('mixExportTask').perform();
    },

    saveMix() {
      this.get('mixSaveTask').perform();
    },

    play(beat) {
      this.get('mix').play(beat);
    },

    pause(beat) {
      this.get('mix').pause(beat);
    },

    playpause(beat) {
      this.get('mix').playpause(beat);
    },

    skipBack() {
      this.get('mix').seekToBeat(0);
    },

    skipForth() {
      Ember.Logger.log("skip forth unimplemented");
    },

    seekToBeat(beat) {
      this.get('mix').seekToBeat(beat);
    },

    selectQuantization(quantization) {
      this.set('selectedQuantizations', [quantization]);
    },

    selectClip(clip) {
      Ember.Logger.log('selectClip', clip);
      if (clip === this.get('selectedClip')) {
        this.set('selectedClip', null);
      } else {
        this.set('selectedClip', clip);
      }
    },

    selectTransition(transition) {
      this.sendAction('selectTransition', transition);
    },

    zoomToClip(...args) {
      const mixVisual = this.get('mixVisualActionReceiver');
      mixVisual && mixVisual.send.apply(mixVisual, ['zoomToClip'].concat(args));
    },

    resetZoom(...args) {
      const mixVisual = this.get('mixVisualActionReceiver');
      mixVisual && mixVisual.send.apply(mixVisual, ['resetZoom'].concat(args));
    },

    quantizeBeat(beat) {
      return this._quantizeBeat(beat);
    },

    removeItem(mixItem) {
      const mix = this.get('mix');
      mix.removeObject(mixItem);
    },

    moveItem(mixItem, newIndex) {
      const mix = this.get('mix');
      const prevIndex = mixItem.get('index');

      // if moving forwards, have to include current index
      if (newIndex > prevIndex) {
        newIndex++;
      }

      mix.insertAt(newIndex, mixItem);
    },

    playItem(mixItem) {
      mixItem.get('trackClip').then((clip) => {
        this.send('zoomToClip', clip, true);
        this.send('play', clip.get('startBeat'));
      });
    },

    addTrack(track) {
      track = track ? track : this.get('store').createRecord('track');

      const mix = this.get('mix');

      const endBeat = this._quantizeBeat(mix.get('endBeat'));

      mix.appendTrack(track).then((mixItem) => {
        const fromTrackClip = mixItem.get('prevItem.trackClip');

        if (fromTrackClip) {
          // TODO(TECHDEBT): move to mix model? make work for adding many tracks?
          // TODO(TECHDEBT): this works, have to do this because we cant directly set endBeat
          const fromTrackBpm = fromTrackClip.get('track.audioMeta.bpm');
          const audioEndTime = beatToTime((endBeat - fromTrackClip.get('startBeat')), fromTrackBpm) + fromTrackClip.get('audioStartTime');
          fromTrackClip.set('audioEndTime', audioEndTime);
        }
      });
    },

    onPageDrop(files) {
      Ember.Logger.log("page drop", files);

      const store = this.get('store');
      const mix = this.get('controller.mix');

      // for each file, create track and add to mix
      files.map((file) => {

        const track = store.createRecord('track', {
          title: file.name,
          file,
        });

        track.get('audioBinary.analyzeAudioTask').perform();
        this.send('addTrack', track);
      });
    },

    // appendRandomTrack() {
    //   const mix = this.get('mix');
    //   const tracks = this.get('searchTracks.content');
    //   const randomTrack = _.sample(tracks.toArray());

    //   mix.appendTrack(randomTrack);
    // },

    // toggleShowVolumeAutomation() {
    //   this.toggleProperty('showVolumeAutomation');
    // },
  },

  // TODO(TECHDEBT): make this work with query param for sleected transition?
  _selectedTransitionDidChange: Ember.observer('selectedTransition', function() {
    const transition = this.get('selectedTransition');

    Ember.run.next(() => {
      if (transition) {
        this.send('zoomToClip', transition.get('transitionClip'), true);
      } else {
        this.send('resetZoom', true);
      }
    });
  }).on('didInsertElement'),

  _quantizeBeat(beat) {
    const quantization = this.get('selectedQuantization');

    // TODO(TECHDEBT): does this make sense to always say? how to tell if this event is active?
    // if alt key is held, suspend quantization
    const isAltKeyHeld = Ember.get(d3, 'event.sourceEvent.altKey') || false;
    if (isAltKeyHeld) {
      return beat;
    }

    let quantizedBeat = beat;
    switch (quantization) {
      case BEAT_QUANTIZATION:
        quantizedBeat = Math.round(beat);
        break;
      case BAR_QUANTIZATION:
        // TODO(TECHDEBT): implement
        quantizedBeat = Math.round(beat);
        // quantizedBeat = beatGrid.barToBeat(beatGrid.quantizeBar(beatGrid.beatToBar(beat)));
        break;
      default: quantizedBeat = beat;
    }

    return quantizedBeat;
  },
});


