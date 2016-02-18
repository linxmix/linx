import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import BubbleActions from 'linx/lib/bubble-actions';
import ArrangementPlayerMixin from 'linx/mixins/components/arrangement-player';
import ArrangementVisualMixin from 'linx/mixins/components/arrangement-visual';

import subtract from 'linx/lib/computed/subtract';
import { isNumber } from 'linx/lib/utils';

import { MIX_ITEM_PREVIEW_DISTANCE } from 'linx/components/simple-mix';
import {
  BAR_QUANTIZATION,
  BEAT_QUANTIZATION,
  TICK_QUANTIZATION,
  MS10_QUANTIZATION,
  MS1_QUANTIZATION,
  SAMPLE_QUANTIZATION,
} from 'linx/models/track/audio-meta/beat-grid';

export default Ember.Component.extend(
  ArrangementPlayerMixin,
  ArrangementVisualMixin,
  RequireAttributes('transition'), {

  classNames: ['SimpleTransition'],
  classNameBindings: [],

  // optional params
  pxPerBeat: 25,

  actions: {

    playTransition() {
      this.send('viewTransition');

      this.get('transitionClip.readyPromise').then((clip) => {
        this.send('play', clip.get('startBeat') - MIX_ITEM_PREVIEW_DISTANCE);
      });
    },

    viewTransition() {
      this.get('transitionClip.readyPromise').then((clip) => {
        this.send('zoomToClip', clip);
      });
    },

    selectQuantization(quantization) {
      this.set('selectedQuantizations', [quantization]);
    },

    onTransitionClipClick(clip) {
      // this.sendAction('transitionToTransition', clip.get('transition'));
    },

    onTrackClipDrag(clip) {
      const dx = d3.event.dx;
      const beatDifference = dx / this.get('pxPerBeat') / this.get('zoom').scale();
      const beat = this.get('toTrackStartBeat') - beatDifference; // switch direcdtion for toTrack vs fromTrack
      console.log('trackClipDrag', beat, beatDifference);
      Ember.run.throttle(this, 'moveTrackMarker', this.get('toTrackMarker'), beat, 10, true);
      // this.moveTrackMarker(this.get('toTrackMarker'), beat);
    },
  },

  moveTrackMarker(marker, beat) {
    const beatGrid = marker.get('beatGrid');
    const quantization = this.get('selectedQuantization');
    const oldStartBeat = marker.get('beat');

    // TODO(REFACTOR): implement quantization
    // let newStartBeat = beatGrid.quantizeBeat(beat);
    let newStartBeat = beat;
    console.log('newStartBeat', beat);

    // TODO(REFACTOR): tolerance, not exact equality
    if (oldStartBeat !== newStartBeat) {
      marker.set('beat', newStartBeat);
    }
  },

  selectedQuantizations: [BAR_QUANTIZATION],
  selectedQuantization: Ember.computed.reads('selectedQuantizations.firstObject'),

  // implementing ArrangementPlayerMixin
  arrangement: Ember.computed.reads('mix'),

  // simple-transition specific stuff
  fromTrack: Ember.computed.reads('transition.fromTrack'),
  fromTrackMarker: Ember.computed.reads('transition.fromTrackMarker'),
  toTrack: Ember.computed.reads('transition.toTrack'),
  toTrackMarker: Ember.computed.reads('transition.toTrackMarker'),

  mixItem: Ember.computed.reads('transition.mixItem'),
  mix: Ember.computed.reads('mixItem.mix'),
  transitionClip: Ember.computed.reads('mixItem.transitionClip'),
  fromTrackClip: Ember.computed.reads('mixItem.fromTrackClip'),
  toTrackClip: Ember.computed.reads('mixItem.toTrackClip'),

  fromTrackEndBeat: Ember.computed.reads('transition.fromTrackEndBeat'),
  toTrackStartBeat: Ember.computed.reads('transition.toTrackStartBeat'),

  // Hacky stuff to convert <input type="number"> values to numbers
  // inputBpm: Ember.computed.oneWay('metronome.bpm'),
  // inputZoom: Ember.computed.oneWay('pxPerBeat'),
  // _inputBpmDidChange: function() {
  //   this.get('metronome').setBpm(parseFloat(this.get('inputBpm')));
  // }.observes('inputBpm'),
  // _inputZoomDidChange: function() {
  //   // update pxPerBeat
  //   this.set('pxPerBeat', parseFloat(this.get('inputZoom')));
  // }.observes('inputZoom'),

  // inputTransitionLength: Ember.computed.reads('transition.beatCount'),

  // _inputTransitionLength: function() {
  //   let value = parseFloat(this.get('inputTransitionLength'));

  //   if (isNaN(value)) {
  //     return;
  //   }

  //   this.get('transition.readyPromise').then((transition) => {
  //     transition.get('arrangement.clips.firstObject').set('beatCount', value);
  //   });
  // }.observes('inputTransitionLength'),
  // /hacky stuff
});
