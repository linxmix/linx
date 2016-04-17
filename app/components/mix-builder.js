import Ember from 'ember';

import _ from 'npm:underscore';

import {
  BAR_QUANTIZATION,
  BEAT_QUANTIZATION,
  TICK_QUANTIZATION,
  MS10_QUANTIZATION,
  MS1_QUANTIZATION,
  SAMPLE_QUANTIZATION,
} from 'linx/models/track/audio-meta/beat-grid';

export const MIX_ITEM_PREVIEW_DISTANCE = 4;

export const FROM_TRACK_COLOR = '#ac6ac7';
export const TO_TRACK_COLOR = '#16a085';

export default Ember.Component.extend({
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

  actions: {
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

    selectClip(args) {
      console.log("TODO: implement selectClip", args);
    },

    zoomToClip(...args) {
      const mixVisual = this.get('mixVisualActionReceiver');
      mixVisual.send.apply(mixVisual, ['zoomToClip'].concat(args));
    },

    quantizeBeat(beat) {
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
      };

      return quantizedBeat;
    },

    removeItem(mixItem) {
      const mix = this.get('mix');
      mix.removeObject(mixItem);
    },

    playItem(mixItem) {
      mixItem.get('transitionClip').then((clip) => {
        this.send('play', clip.get('startBeat') - MIX_ITEM_PREVIEW_DISTANCE);
      });
    },

    // viewTrack(mixItem) {
    //   mixItem.get('trackClip').then((clip) => {
    //     this.send('zoomToClip', clip);
    //   });
    // },

    // viewTransition(mixItem) {
    //   mixItem.get('transitionClip').then((clip) => {
    //     this.send('didSelectClip', clip);

    //     Ember.run.next(() => {
    //       this.send('zoomToClip', clip);
    //     });
    //   });
    // },

    // clearSelectedClip() {
    //   const selectedClip = this.get('selectedClip');
    //   if (selectedClip) {
    //     this.send('didSelectClip', null);

    //     Ember.run.next(() => {
    //       this.send('zoomToClip', selectedClip);
    //     });
    //   }
    // },

    // optimizeTransition(transition) {
    //   transition && transition.optimize();
    // },

    // addTrack(track) {
    //   const mix = this.get('mix');

    //   mix.appendTrack(track);
    // },

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

  // showVolumeAutomation: true,

});


