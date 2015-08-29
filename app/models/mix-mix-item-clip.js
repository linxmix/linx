import Ember from 'ember';
import DS from 'ember-data';

import ArrangementClip from './arrangement-clip';
import TransitionableClipMixin from 'linx/mixins/models/transitionable-clip';

export default ArrangementClip.extend(TransitionableClipMixin, {
  type: 'mix-mix-item-clip',

  startBeatWithoutTransition: Ember.computed.reads('mix.items.firstObject.startBeat'),
  endBeatWithoutTransition: Ember.computed.reads('numBeats'),

  startBeatWithTransition: Ember.computed.reads('prevTransition.toTrackStartBeat'),
  endBeatWithTransition: function() {
    let numBeats = this.get('numBeats');
    let delta = this.get('mix.validItems.lastObject.clip.endBeat') - this.get('transition.fromTrackEndBeat');
    return numBeats - delta;
  }.property('numBeats', 'mix.validItems.lastObject.clip.endBeat', 'transition.fromTrackEndBeat'),

  mix: Ember.computed.reads('arrangementItem.mix'),
  arrangement: Ember.computed.reads('mix.arrangement'),
});
