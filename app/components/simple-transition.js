import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import BubbleActions from 'linx/lib/bubble-actions';
import ArrangementPlayerMixin from 'linx/mixins/components/arrangement-player';
import ArrangementVisualMixin from 'linx/mixins/components/arrangement-visual';

import subtract from 'linx/lib/computed/subtract';
import { isNumber } from 'linx/lib/utils';

import { MIX_ITEM_PREVIEW_DISTANCE } from 'linx/components/mix-builder';
import {
  BAR_QUANTIZATION,
  BEAT_QUANTIZATION,
  TICK_QUANTIZATION,
  MS10_QUANTIZATION,
  MS1_QUANTIZATION,
  SAMPLE_QUANTIZATION,
} from 'linx/models/track/audio-meta/beat-grid';

export default Ember.Component.extend(
  RequireAttributes('transition'),
  ArrangementPlayerMixin,
  ArrangementVisualMixin, {

  classNames: ['SimpleTransition'],
  classNameBindings: [],

  // optional params
  pxPerBeat: 25,

  // implement ArrangementPlayerMixin
  arrangement: Ember.computed.reads('transition'),

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

    onAutomationClipClick(clip) {
      Ember.Logger.log('onAutomationClipClick');
    },

    onAutomationClipDrag(beats) {
      Ember.Logger.log('onAutomationClipDrag', beats);
    },

    // TODO(REFACTOR): move to simple-transition/track-clip?
    onTrackClipDrag(clip, marker, beats) {
      const newBeat = this.get('_markerStartBeat') - beats;
      Ember.run.throttle(this, 'moveTrackMarker', marker, newBeat, 10, true);
    },

    onTrackClipDragStart(clip, marker) {
      this.set('_markerStartBeat', marker.get('beat'));
    },
  },

  // used to keep track of where marker was when track drag started
  _markerStartBeat: 0,

  moveTrackMarker(marker, beat) {
    const beatGrid = marker.get('beatGrid');
    const quantization = this.get('selectedQuantization');
    const oldStartBeat = marker.get('beat');

    let newStartBeat;
    switch (quantization) {
      case BEAT_QUANTIZATION:
        newStartBeat = beatGrid.quantizeBeat(beat);
        break;
      case BAR_QUANTIZATION:
        newStartBeat = beatGrid.barToBeat(beatGrid.quantizeBar(beatGrid.beatToBar(beat)));
        break;
      default: newStartBeat = beat;
    };
    Ember.Logger.log('moveTrackMarker', beat, newStartBeat);

    // TODO(REFACTOR): tolerance, not exact equality
    if (oldStartBeat !== newStartBeat) {
      marker.set('beat', newStartBeat);
    }
  },

  selectedQuantizations: [BAR_QUANTIZATION],
  selectedQuantization: Ember.computed.reads('selectedQuantizations.firstObject'),

  // simple-transition specific stuff
  transitionClip: Ember.computed.reads('transition.transitionClip'),
  mixItem: Ember.computed.reads('transitionClip.mixItem'),
  mix: Ember.computed.reads('mixItem.mix'),
  fromTrackClip: Ember.computed.reads('mixItem.trackClip'),
  toTrackClip: Ember.computed.reads('mixItem.nextTrackClip'),

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
