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

import {
  CONTROL_TYPE_VOLUME,
} from 'linx/mixins/playable-arrangement/automatable-clip/control';

import { beatToTime, isValidNumber, clamp, makeKeybinding } from 'linx/lib/utils';

export const FROM_TRACK_COLOR = '#ac6ac7';
export const TO_TRACK_COLOR = '#16a085';

export const AUTOSAVE_INTERVAL = 5000;

// max blob size in chrome is 500Mib
// which allows ~45min of recording time per blob
const MAX_BLOB_SIZE = 500000000;
const MAX_RECORD_SECONDS = 47 * 60; // [s] max record time in seconds

export default Ember.Component.extend(
  EKMixin,
  EKOnInsertMixin, {
  classNames: ['MixBuilder', 'VerticalLayout', 'VerticalLayout--fullHeight'],

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

  followPlayhead: false,
  selectedAutomation: CONTROL_TYPE_VOLUME,
  newTrackPosition: Ember.computed('mix.length', function() {
    return this.get('mix.length') + 1;
  }),

  _playpauseMix: Ember.on(keyDown('Space'), makeKeybinding(function(e) {
    this.send('playpause');
  })),

  _exitTransitionOnEscape: Ember.on(keyDown('Escape'), makeKeybinding(function(e) {
    this.send('selectTransition', null);
  })),

  _pauseMix: Ember.on('willDestroyElement', function() {
    this.send('pause');
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

  // maxRecordTime: multiply('audioContext.sampleRate', MAX_BLOB_SIZE)'', function() {
  //   const sampleRate = this.get('audioContext.sampleRate');
  //   return this.get('sampleRate') *
  // })

// mix record task auto stop
// - start record task with record duration (default to remaining mix time)
// - record gets task blobs from internal blob task, #iterations based on max blob size and record duration
// - two ways to end:
//     - on “stopRecording”, stop blob task and download rest
//     - on record duration elapsed, stop blob task and download rest

  recorderNode: Ember.computed('mix.inputNode.content', function() {
    const inputNode = this.get('mix.inputNode.content');

    return inputNode && new Recorder(inputNode);
  }),

  outputBlobsCount: 0,
  mixRecordTask: task(function * () {
    const mix = yield this.get('mix');
    const recorderNode = this.get('recorderNode');

    const totalRecordDuration = mix.getRemainingDuration();
    const totalBlobs = Math.ceil(totalRecordDuration / MAX_RECORD_SECONDS);

    this.set('outputBlobsCount', 0);

    // add extra buffer while recording
    // TODO(TECHDEBT): do not share state this way
    window.BUFFER_SIZE = window.MAX_BUFFER_SIZE;

    let didStopRecording = false;

    this.one('stopRecord', () => {
      mix.pause();

      // TODO(TECHDEBT): make this more elegant than just canceling
      this.get('mixRecordTask').cancelAll();

      return exportBlob(true);
    });

    const exportBlob = (isLastBlob = false) => {
      if (didStopRecording) {
        console.warn('cannot exportBlob after didStopRecording');
      } else {
        didStopRecording = isLastBlob;
      }

      recorderNode.stop();
      return new Ember.RSVP.Promise((resolve, reject) => {
        recorderNode.exportWAV((blob) => {
          const fileName = `${mix.get('title')} - ${this.get('outputBlobsCount')}.wav`;
          _forceDownload(blob, fileName);
          resolve();
        });
        this.incrementProperty('outputBlobsCount');

        if (isLastBlob) {
          // reset buffer size
          window.BUFFER_SIZE = ~~(window.MAX_BUFFER_SIZE / 8);
          console.log('finish recording', this.get('outputBlobsCount'));
        }
      });
    };

    console.log('recording started', { totalRecordDuration, totalBlobs });

    while ((this.get('outputBlobsCount') < totalBlobs)) {

      // record chunk
      recorderNode.clear();
      recorderNode.record();
      mix.play(mix.getCurrentBeat() - 1.75); // ensure slight overlap
      yield new Ember.RSVP.Promise((resolve) => {
        Ember.run.later(resolve, 1000 * Math.min(MAX_RECORD_SECONDS, mix.getRemainingDuration()));
      });

      if (didStopRecording) { return; }

      // export chunk
      mix.pause();
      exportBlob();
    }
  }).drop(),

  jumpTrackTask: task(function * (mixItem) {
    const track = mixItem.get('track');
    const mix = this.get('mix');
    const jumpTransitionBeatCount = 2;
    const jumpTransitionStartVolume = 0;
    const jumpTransitionVolumeControlPointCount = 3;

    //
    // get jump beats
    //
    const { jumpFromBeat, jumpToBeat } = yield new Ember.RSVP.Promise((resolve, reject) => {
      let jumpFromBeat, jumpToBeat;

      function getJumpBeats(beat) {

        // first trigger is jumpFrom
        if (!(isValidNumber(jumpFromBeat))) {
          jumpFromBeat = beat;

        // second is jumpTo
        } else if (!(isValidNumber(jumpToBeat))) {
          jumpToBeat = beat - jumpTransitionBeatCount;
          this.off('seekToBeat', this, getJumpBeats);
          resolve({ jumpFromBeat, jumpToBeat });
        }
      }

      this.on('seekToBeat', this, getJumpBeats);
    });

    // convert arrangement jump beats to track audio time
    const trackClip = yield mixItem.get('trackClip');
    const jumpFromTime = trackClip.getAudioTimeFromArrangementBeat(jumpFromBeat);
    const jumpToTime = trackClip.getAudioTimeFromArrangementBeat(jumpToBeat);

    // insert new item in front of existing
    const newMixItem = yield mix.insertTrackAt(mixItem.get('index'), track);

    //
    // set start and end times
    //
    const prevTrackClip = yield newMixItem.get('trackClip');
    const nextTrackClip = trackClip;

    // duplicate track clip settings
    prevTrackClip.setProperties(nextTrackClip.getProperties('transpose', 'gain'));

    console.log('setting prevtrack clip properties', {
      audioStartTime: nextTrackClip.get('audioStartTime'),
      audioEndTime: jumpFromTime,
    });
    prevTrackClip.setProperties({
      audioStartTime: nextTrackClip.get('audioStartTime'),
      audioEndTime: jumpFromTime,
    });

    console.log('setting nexttrack clip properties', {
      audioStartTime: jumpToTime,
    });
    nextTrackClip.setProperties({
      audioStartTime: jumpToTime,
    });

    //
    // setup jump transition
    //
    const jumpTransitionClip = yield newMixItem.get('transitionClip');
    const jumpTransition = yield jumpTransitionClip.get('transition');

    yield jumpTransition.optimize({
      beatCount: jumpTransitionBeatCount,
      startVolume: jumpTransitionStartVolume,
      volumeControlPointCount: jumpTransitionVolumeControlPointCount,
      isFromTrackDelayBypassed: true,
    });

    this.send('selectTransition', jumpTransition);
    return jumpTransition;
  }).drop(),

  beatDetection: Ember.inject.service(),

  actions: {
    jumpTrack(mixItem) {
      return this.get('jumpTrackTask').perform(mixItem);
    },

    recordMix() {
      return this.get('mixRecordTask').perform();
    },

    stopRecord() {
      this.trigger('stopRecord');
    },

    saveMix() {
      this.get('mixSaveTask').perform();
    },

    play(beat) {
      this.get('mix').play(beat);
    },

    pause() {
      if (this.get('selectedTransition')) {
        this.get('mix').stop();
      } else {
        this.get('mix').pause();
      }
    },

    playpause(beat) {
      this.send(this.get('mix.isPlaying') ? 'pause' : 'play', beat);
    },

    skipBack() {
      this.get('mix').seekToBeat(0);
    },

    // TODO(TECHDEBT): just use arr-visual.centerView
    centerView(doAnimate) {
      const mix = this.get('mix');
      this.send('zoomToBeat', mix.getCurrentBeat(), doAnimate);
    },

    skipForth() {
      Ember.Logger.log("skip forth unimplemented");
    },

    seekToBeat(beat) {
      const quantizedBeat = this._quantizeBeat(beat);

      this.get('mix').seekToBeat(quantizedBeat);
      this.trigger('seekToBeat', quantizedBeat);
    },

    selectQuantization(quantization) {
      this.set('selectedQuantizations', [quantization]);
    },

    selectAutomation(automation) {
      this.set('selectedAutomation', automation);
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

      this.send('pause');
      Ember.run.once(this, this._updateTransitionZoom, transition);
      Ember.run.next(this, 'send', 'play')
    },

    zoomToClip(...args) {
      const mixVisual = this.get('mixVisualActionReceiver');
      mixVisual && mixVisual.send.apply(mixVisual, ['zoomToClip'].concat(args));
    },

    resetZoom(...args) {
      const mixVisual = this.get('mixVisualActionReceiver');
      mixVisual && mixVisual.send.apply(mixVisual, ['resetZoom'].concat(args));
    },

    zoomToBeat(...args) {
      const mixVisual = this.get('mixVisualActionReceiver');
      mixVisual && mixVisual.send.apply(mixVisual, ['zoomToBeat'].concat(args));
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

      console.log('moveItem', mixItem.get('track.title'), newIndex);

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
      const index = clamp(0, this.get('newTrackPosition') - 1, mix.get('length'));
      const endBeat = this._quantizeBeat(mix.get('endBeat'));

      mix.insertTrackAt(index, track).then((mixItem) => {
        mixItem.get('trackClip').then((trackClip) => {

          //
          // set or update default beat grid
          //
          let barGridTime = track.get('audioMeta.barGridTime');
          if (!isValidNumber(barGridTime)) {
            this.get('beatDetection.analyzeTrackTask').perform(track).then(({ peaks }) => {
              barGridTime = peaks[0].time;
              track.set('audioMeta.barGridTime', barGridTime);
              trackClip.set('audioStartTime', barGridTime);
            });
          } else {
            trackClip.set('audioStartTime', barGridTime);
          }


          //
          // possibly move transition clip
          //
          const fromTrackClip = mixItem.get('prevItem.trackClip');

          if (fromTrackClip) {
            // TODO(TECHDEBT): move to mix model? make work for adding many tracks?
            // TODO(TECHDEBT): this works, have to do this because we cant directly set endBeat
            const fromTrackBpm = fromTrackClip.get('track.audioMeta.bpm');
            const audioEndTime = beatToTime((endBeat - fromTrackClip.get('startBeat')), fromTrackBpm) + fromTrackClip.get('audioStartTime');

            if (isValidNumber(audioEndTime)) {
              fromTrackClip.set('audioEndTime', audioEndTime);
            }
          }

        });
      });
    },

    onPageDrop(files) {
      Ember.Logger.log('page drop', files);

      const store = this.get('store');
      const mix = this.get('controller.mix');

      // for each file, create track and add to mix
      files.map((file) => {

        const track = store.createRecord('track', {
          title: file.name,
          file,
        });

        track.get('extractId3TagsTask').perform();
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

  _updateTransitionZoom(transition) {
    Ember.run.next(() => {
      if (transition) {
        this.send('zoomToClip', transition.get('transitionClip'), true);
      } else {
        this.send('resetZoom', true);
      }
    });
  },

  _quantizeBeat(beat, quantization) {
    const beatGrid = this.get('mix.beatGrid');

    // get default quantization
    // TODO(TECHDEBT): does this make sense to always say? how to tell if this event is active?
    let defaultQuantization = this.get('selectedQuantization');
    const isAltKeyHeld = Ember.get(d3, 'event.sourceEvent.altKey') || Ember.get(d3, 'event.altKey');
    const isCtrlKeyHeld = Ember.get(d3, 'event.sourceEvent.ctrlKey') || Ember.get(d3, 'event.ctrlKey') ||
      Ember.get(d3, 'event.sourceEvent.metaKey') || Ember.get(d3, 'event.metaKey');
    if (isAltKeyHeld) {
      quantization = SAMPLE_QUANTIZATION;
    } else if (isCtrlKeyHeld) {
      quantization = BEAT_QUANTIZATION;
    }

    quantization = quantization ? quantization : defaultQuantization;

    // console.log('_quantizeBeat', quantization, beat, beatGrid, Ember.get(d3, 'event'))

    let quantizedBeat = beat;
    switch (quantization) {
      case BEAT_QUANTIZATION:
        quantizedBeat = beatGrid.quantizeBeat(beat);
        break;
      case BAR_QUANTIZATION:
        quantizedBeat = beatGrid.beatToQuantizedDownbeat(beat);
        break;
      default: quantizedBeat = beat;
    }

    return quantizedBeat;
  },
});

// adapted from Recorder.forceDownload, which stopped working
function _forceDownload(blob, fileName) {
  const url = (window.URL || window.webkitURL).createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = fileName || 'output.wav';
  // const click = document.createEvent("Event");
  // click.initEvent("click", true, true);
  // link.dispatchEvent(click);
  link.click();
}
