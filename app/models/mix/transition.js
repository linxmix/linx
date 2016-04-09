import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import ReadinessMixin from 'linx/mixins/readiness';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import { CONTROL_TYPE_VOLUME } from 'linx/mixins/playable-arrangement/automatable-clip/control';

export default DS.Model.extend(
  PlayableArrangementMixin,
  DependentRelationshipMixin('automationClips'),
  ReadinessMixin('isTransitionReady'), {

  title: DS.attr('string'),
  description: DS.attr('string'),
  beatCount: DS.attr('number', { defaultValue: 16 }),
  transitionClip: DS.belongsTo('mix/transition-clip'),

  fromTrackClip: Ember.computed.reads('transitionClip.fromTrackClip'),
  toTrackClip: Ember.computed.reads('transitionClip.toTrackClip'),

  automationClips: DS.hasMany('mix/transition/automation-clip'),

  fromTrackAutomationClips: Ember.computed('automationClips.@each.targetClip', 'fromTrackClip.content', function() {
    return this.get('automationClips').filterBy('targetClip.content', this.get('fromTrackClip.content'));
  }),

  toTrackAutomationClips: Ember.computed('automationClips.@each.targetClip', 'toTrackClip.content', function() {
    return this.get('automationClips').filterBy('targetClip.content', this.get('toTrackClip.content'));
  }),

  // implementing PlayableArrangement
  audioContext: Ember.computed.reads('transitionClip.audioContext'),
  outputNode: Ember.computed.reads('transitionClip.outputNode.content'),
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

    return this.destroyAutomationClips().then(() => {
      const store = this.get('store');
      return Ember.RSVP.all([this.get('fromTrackClip'), this.get('toTrackClip')])
        .then(([ fromTrackClip, toTrackClip ]) => {

        if (fromTrackClip && toTrackClip) {
          const beatCount = 16;
          this.set('beatCount', beatCount);

          const fromTrackVolumeClip = store.createRecord('mix/transition/automation-clip', {
            controlType: CONTROL_TYPE_VOLUME,
            transition: this,
            targetClip: fromTrackClip,
          });
          fromTrackVolumeClip.addControlPoints(generateControlPointParams({
            beatCount,
            direction: -1
          }));

          const toTrackVolumeClip = store.createRecord('mix/transition/automation-clip', {
            controlType: CONTROL_TYPE_VOLUME,
            transition: this,
            targetClip: toTrackClip,
          });
          toTrackVolumeClip.addControlPoints(generateControlPointParams({
            beatCount,
            direction: 1
          }));

          this.get('automationClips').addObjects([fromTrackVolumeClip, toTrackVolumeClip]);
        }

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

function generateControlPointParams({ beatCount = 16, direction = 1, n = 4 }) {
  const range = _.range(0, n + 1);
  if (direction === -1) { range.reverse(); }

  return range.map((x, i) => {
    return {
      beat: beatCount * (i / n),
      value: x / n,
    };
  });
}
