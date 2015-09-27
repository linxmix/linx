import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import Clip from './clip';
import { clamp } from 'linx/lib/utils';

export default Clip.extend(
  BubbleActions(), RequireAttributes(), {

  actions: {},
  classNames: ['TransitionClip'],
  classNameBindings: [],

  // params
  fromClip: Ember.computed.reads('clip.fromClip'),
  toClip: Ember.computed.reads('clip.toClip'),
  numBeats: Ember.computed.reads('clip.numBeats'),

  // called with x in range [0, 1]
  // expected to update automatables
  updateValue(x) {
    let { fromClip, toClip } = this.getProperties('fromClip', 'toClip');

    // CONSTANT POWER SLOW FADE
    // cos((4 / π)((2x−1)^(2n+1)+1))
    let n = 10; // 0, 1, 3, 10
    let inner = Math.pow((2 * x) - 1, (2 * n) + 1);
    let fromClipVolume = Math.cos((Math.PI / 4) * (inner + 1));

    inner = Math.pow((2 * (1 - x)) - 1, (2 * n) + 1);
    let toClipVolume = Math.cos((Math.PI / 4) * (inner + 1));
    // / CONSTANT POWER SLOW FADE

    // LOGARITHMIC FADE
    // y = b*c^x

    // console.log('_updateClipVolumes', fromClipVolume, toClipVolume, fromClip, toClip);

    // TODO(AUTOMATION): clamped computed property
    fromClip && fromClip.set('volume', clamp(0, fromClipVolume, 1));
    toClip && toClip.set('volume', clamp(0, toClipVolume, 1));
  },

  _updateClipVolumes: function() {
    let { clipEvent, numBeats, isFinished } = this.getProperties('clipEvent', 'numBeats', 'isFinished');
    let currentBeat = clipEvent.getCurrentBeat();

    let x = isFinished ? 1 : currentBeat / numBeats;
    this.updateValue(x);
  },

  _automationDidTick: function() {
    Ember.run.once(this, '_updateClipVolumes');
  }.observes('numBeats', 'clipEvent.tick', 'isFinished', 'isPlaying', 'seekBeat'),
});
