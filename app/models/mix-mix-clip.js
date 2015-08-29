import Ember from 'ember';
import DS from 'ember-data';

import ArrangementClip from './arrangement-clip';
import TransitionableClipMixin from 'linx/mixins/models/transitionable-clip';

export default ArrangementClip.extend(TransitionableClipMixin, {
  type: 'mix-mix-clip',
  mix: DS.belongsTo('mix', { async: true }),
  arrangement: Ember.computed.reads('mix.arrangement'),

  startBeatWithoutTransition: Ember.computed.reads('mix.validEvents.firstObject.startBeat'),
  endBeatWithoutTransition: Ember.computed.reads('numBeats'),

  startBeatWithTransition: Ember.computed.reads('prevTransition.toTrackStartBeat'),
  endBeatWithTransition: function() {
    let numBeats = this.get('numBeats');
    let delta = this.get('mix.validEvents.lastObject.clip.endBeat') - this.get('nextTransition.fromTrackEndBeat');
    return numBeats - delta;
  }.property('numBeats', 'mix.validEvents.lastObject.clip.endBeat', 'nextTransition.fromTrackEndBeat'),
});
