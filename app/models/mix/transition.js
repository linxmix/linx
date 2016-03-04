import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from 'linx/mixins/readiness';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';

export default DS.Model.extend(
  PlayableArrangementMixin,
  ReadinessMixin('isTransitionReady'), {

  title: DS.attr('string'),
  description: DS.attr('string'),
  transitionClip: DS.belongsTo('mix/transition-clip'),

  fromTrackClip: Ember.computed.reads('transitionClip.fromTrackClip'),
  toTrackClip: Ember.computed.reads('transitionClip.toTrackClip'),

  automationClips: DS.hasMany('mix/transition/automation-clip'),

  // implementing PlayableArrangement
  audioContext: Ember.computed.reads('transitionClip.audioContext'),
  outputNode: Ember.computed.reads('transitionClip.outputNode'),
  clips: Ember.computed.reads('automationClips'), // TODO(POLYMORHPISM)

  // optimizes this transition, with given constraints
  // TODO(REFACTOR2)
  optimize({
    fromTrack,
    toTrack,
    preset,
    minFromTrackEndBeat,
    maxToTrackStartBeat,
    fromTrackEnd,
    toTrackStart,
  }) {
    return this.get('readyPromise').then(() => {
      fromTrack = fromTrack || this.get('fromTrackClip.track.content');
      toTrack = toTrack || this.get('toTrackClip.track.content');

      minFromTrackEndBeat = minFromTrackEndBeat || this.get('fromTrackClip.audioStartBeat');
      maxToTrackStartBeat = maxToTrackStartBeat || this.get('toTrackClip.audioEndBeat');

      Ember.assert('Must have fromTrack and toTrack to optimizeTransition', Ember.isPresent(fromTrack) && Ember.isPresent(toTrack));

      return Ember.RSVP.all([
        fromTrack.get('readyPromise'),
        toTrack.get('readyPromise'),
      ]).then(() => {

        // TODO(TRANSITION): improve this algorithm, add options and presets
        console.log("OPTIMIZE TRANSITION");

        return this;
      });

    });
  },
});
