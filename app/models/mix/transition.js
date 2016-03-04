import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from 'linx/mixins/readiness';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';

import { CONTROL_TYPE_GAIN } from 'linx/mixins/playable-arrangement/automatable-clip/control';

export default DS.Model.extend(
  PlayableArrangementMixin,
  ReadinessMixin('isTransitionReady'), {

  title: DS.attr('string'),
  description: DS.attr('string'),
  transitionClip: DS.belongsTo('mix/transition-clip'),

  fromTrackClip: Ember.computed.reads('transitionClip.fromTrackClip'),
  toTrackClip: Ember.computed.reads('transitionClip.toTrackClip'),

  automationClips: DS.hasMany('mix/transition/automation-clip'),

  fromTrackAutomationClips: Ember.computed('automationClips.@each.targetClip', 'fromTrackClip', function() {
    return this.get('automationClips').filterBy('targetClip', this.get('fromTrackClip'));
  }),

  toTrackAutomationClips: Ember.computed('automationClips.@each.targetClip', 'toTrackClip', function() {
    return this.get('automationClips').filterBy('targetClip', this.get('toTrackClip'));
  }),

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
  } = {}) {
    minFromTrackEndBeat = minFromTrackEndBeat || this.get('fromTrackClip.audioStartBeat');
    maxToTrackStartBeat = maxToTrackStartBeat || this.get('toTrackClip.audioEndBeat');

    // TODO(REFACTOR2): improve this algorithm, add options and presets
    console.log("OPTIMIZE TRANSITION");

    return this.destroyAutomationClips().then(() => {
      const store = this.get('store');
      return Ember.RSVP.all([this.get('fromTrackClip'), this.get('toTrackClip')]).then(([ fromTrackClip, toTrackClip ]) => {

      console.log("BEFORE CREATE TRANSITION", fromTrackClip, toTrackClip);

        debugger;
        const fromTrackVolumeClip = store.createRecord('mix/transition/automation-clip', {
          controlType: CONTROL_TYPE_GAIN,
          transition: this,
          targetClip: fromTrackClip,
        });


        const toTrackVolumeClip = store.createRecord('mix/transition/automation-clip', {
          controlType: CONTROL_TYPE_GAIN,
          transition: this,
          targetClip: toTrackClip,
        });

      console.log("BEFORE ADD CLIPS");
        this.get('automationClips').addObjects([fromTrackVolumeClip, toTrackVolumeClip]);
      console.log("AFTERADD CLIPS");
        return this;
      });
    });

  },

  destroyAutomationClips() {
    return this.get('automationClips').then((automationClips) => {
      return Ember.RSVP.all(automationClips.toArray().invoke('destroyRecord'));
    });
  },
});
