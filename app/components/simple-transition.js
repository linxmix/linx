import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import BubbleActions from 'linx/lib/bubble-actions';
import ArrangementPlayerMixin from 'linx/mixins/arrangement-player';

import subtract from 'linx/lib/computed/subtract';
import { isNumber } from 'linx/lib/utils';

import { MIX_ITEM_PREVIEW_DISTANCE } from 'linx/components/simple-mix';

export default Ember.Component.extend(ArrangementPlayerMixin,
  RequireAttributes('transition'), {

  classNames: ['SimpleTransition'],
  classNameBindings: [],

  actions: {
    // TODO: abstract for syncToBeat,syncToBar,noSync[debounce]
    dragFromTrackClip(beat) {
      let fromTrackMarker = this.get('fromTrackMarker');
      let beatGrid = fromTrackMarker.get('beatGrid');

      let oldStartBeat = fromTrackMarker.get('startBeat');
      let newStartBeat = ~~beat;

      // TODO: tolerance, not exact equality
      if (oldStartBeat !== newStartBeat) {
        fromTrackMarker.set('startBeat', newStartBeat);
      }
    },

    playTransition() {
      this.send('viewTransition');

      this.get('transitionClip.readyPromise').then((clip) => {
        this.send('play', clip.get('startBeat') - MIX_ITEM_PREVIEW_DISTANCE);
      });
    },

    viewTransition() {
      this.get('transitionClip.readyPromise').then((clip) => {
        this.set('scrollCenterBeat', clip.get('centerBeat'));
      });
    },
  },

  // implementing ArrangementPlayerMixin
  arrangement: Ember.computed.reads('mix'),

  // simple-transition specific stuff
  mix: Ember.computed('transition', function() {
    let transition = this.get('transition');
    return transition && transition.generateMix();
  }),

  fromTrack: Ember.computed.reads('transition.fromTrack'),
  fromTrackMarker: Ember.computed.reads('transition.fromTrackMarker'),
  toTrack: Ember.computed.reads('transition.toTrack'),
  toTrackMarker: Ember.computed.reads('transition.toTrackMarker'),

  mixItem: Ember.computed.reads('mix.items.firstObject'),
  transitionClip: Ember.computed.reads('mixItem.transitionClip'),
  fromTrackClip: Ember.computed.reads('mixItem.fromTrackClip'),
  toTrackClip: Ember.computed.reads('mixItem.toTrackClip'),

  fromTrackEndBeat: Ember.computed.reads('transition.fromTrackEndBeat'),
  toTrackStartBeat: Ember.computed.reads('transition.toTrackStartBeat'),

  // Hacky stuff to convert <input type="number"> values to numbers
  inputBpm: Ember.computed.oneWay('metronome.bpm'),
  inputZoom: Ember.computed.oneWay('pxPerBeat'),
  _inputBpmDidChange: function() {
    this.get('metronome').setBpm(parseFloat(this.get('inputBpm')));
  }.observes('inputBpm'),
  _inputZoomDidChange: function() {
    // update pxPerBeat
    this.set('pxPerBeat', parseFloat(this.get('inputZoom')));
  }.observes('inputZoom'),
  // /hacky stuff

  // Hacky stuff to convert <input type="number"> values to numbers
  inputFromTrackEndBeat: subtract('fromTrackEndBeat', 'fromTrackFirstBeat'),
  inputToTrackStartBeat: subtract('toTrackStartBeat', 'toTrackFirstBeat'),
  inputTransitionLength: Ember.computed.reads('transition.numBeats'),

  _inputFromTrackEndBeat: function() {
    let value = parseFloat(this.get('inputFromTrackEndBeat'));

    if (value === NaN) {
      return;
    }

    // TODO
    this.get('transition.readyPromise').then((transition) => {
      transition.setFromTrackEndBeat(value + this.get('fromTrackFirstBeat'));
    });
  }.observes('inputFromTrackEndBeat'),
  _inputToTrackStartBeat: function() {
    let value = parseFloat(this.get('inputToTrackStartBeat'));

    if (value === NaN) {
      return;
    }

    // TODO
    this.get('transition.readyPromise').then((transition) => {
      transition.setToTrackStartBeat(value + this.get('toTrackFirstBeat'));
    });
  }.observes('inputToTrackStartBeat'),
  _inputTransitionLength: function() {
    let value = parseFloat(this.get('inputTransitionLength'));

    if (value === NaN) {
      return;
    }

    this.get('transition.readyPromise').then((transition) => {
      transition.get('arrangement.clips.firstObject').set('numBeats', value);
    });
  }.observes('inputTransitionLength'),
  // /hacky stuff
});
