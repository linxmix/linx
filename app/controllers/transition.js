import Ember from 'ember';

import subtract from 'linx/lib/computed/subtract';
import { isNumber } from 'linx/lib/utils';

export default Ember.Controller.extend({
  // expected params
  model: null,

  mix: Ember.computed('model', function() {
    let transition = this.get('model');

    return transition && transition.generateMix();
  }),

  transitionItem: Ember.computed.reads('mix.transitionItems.firstObject'),
  transitionClip: Ember.computed.reads('transitionItem.clip'),

  // scroll to center of transitionClip
  scrollCenterBeat: Ember.computed('transitionClip.isReady', function() {
    if (this.get('transitionClip.isReady')) {
      return this.get('transitionClip.centerBeat');
    }
  }),

  fromTrackEndBeat: Ember.computed.reads('model.fromTrackEndBeat'),
  toTrackStartBeat: Ember.computed.reads('model.toTrackStartBeat'),

  // Hacky stuff to convert <input type="number"> values to numbers
  inputFromTrackEndBeat: subtract('fromTrackEndBeat', 'fromTrackFirstBeat'),
  inputToTrackStartBeat: subtract('toTrackStartBeat', 'toTrackFirstBeat'),
  inputTransitionLength: Ember.computed.reads('model.numBeats'),

  _inputFromTrackEndBeat: function() {
    let value = parseFloat(this.get('inputFromTrackEndBeat'));

    if (value === NaN) {
      return;
    }

    // TODO
    this.get('model.readyPromise').then((transition) => {
      transition.setFromTrackEndBeat(value + this.get('fromTrackFirstBeat'));
    });
  }.observes('inputFromTrackEndBeat'),
  _inputToTrackStartBeat: function() {
    let value = parseFloat(this.get('inputToTrackStartBeat'));

    if (value === NaN) {
      return;
    }

    // TODO
    this.get('model.readyPromise').then((transition) => {
      transition.setToTrackStartBeat(value + this.get('toTrackFirstBeat'));
    });
  }.observes('inputToTrackStartBeat'),
  _inputTransitionLength: function() {
    let value = parseFloat(this.get('inputTransitionLength'));

    if (value === NaN) {
      return;
    }

    this.get('model.readyPromise').then((transition) => {
      transition.get('arrangement.clips.firstObject').set('numBeats', value);
    });
  }.observes('inputTransitionLength'),
  // /hacky stuff
});
