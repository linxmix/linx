import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import ClipPlayerMixin from 'linx/mixins/arrangement-player/clip';
import { clamp, isNumber } from 'linx/lib/utils';

export default Ember.Component.extend(
  ClipPlayerMixin,
  BubbleActions(), RequireAttributes(), {

  actions: {},
  classNames: ['ArrangementGridTransitionClip'],
  classNameBindings: [],

  // params
  fromTrackClip: Ember.computed.reads('clip.fromTrackClip'),
  toTrackClip: Ember.computed.reads('clip.toTrackClip'),
  beatCount: Ember.computed.reads('clip.beatCount'),

  // called with x in range [0, 1]
  // expected to update automatables
  updateValue(x) {
    let { fromTrackClip, toTrackClip } = this.getProperties('fromTrackClip', 'toTrackClip');

    // CONSTANT POWER SLOW FADE
    // cos((4 / π)((2x−1)^(2n+1)+1))
    let n = 10; // 0, 1, 3, 10
    let inner = Math.pow((2 * x) - 1, (2 * n) + 1);
    let fromTrackClipVolume = Math.cos((Math.PI / 4) * (inner + 1));

    inner = Math.pow((2 * (1 - x)) - 1, (2 * n) + 1);
    let toTrackClipVolume = Math.cos((Math.PI / 4) * (inner + 1));
    // / CONSTANT POWER SLOW FADE

    // LOGARITHMIC FADE
    // y = b*c^x

    // console.log('_updateClipVolumes', fromTrackClipVolume, toTrackClipVolume, fromTrackClip, toTrackClip);

    // TODO(AUTOMATION): clamped computed property?
    fromTrackClip && fromTrackClip.set('volume', clamp(0, fromTrackClipVolume, 1));
    toTrackClip && toTrackClip.set('volume', clamp(0, toTrackClipVolume, 1));
  },

  // TODO(AUTOMATION): what if two automations are affecting the same automatable?
  _updateClipVolumes: function() {
    let x = Math.max(this.getCurrentEventBeat() / this.get('beatCount'));

    if (isNumber(x)) {
      this.updateValue(x);
    }
  },

  _automationDidTick: function() {
    Ember.run.once(this, '_updateClipVolumes');
  }.observes('beatCount', 'tick', 'isFinished', 'isPlaying', 'seekBeat'),
});
