import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import ReadinessMixin from 'linx/mixins/readiness';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import { CONTROL_TYPE_VOLUME } from 'linx/mixins/playable-arrangement/automatable-clip/control';
import { isValidNumber } from 'linx/lib/utils';

export default DS.Model.extend(
  PlayableArrangementMixin,
  DependentRelationshipMixin('fromTrackAutomationClips'),
  DependentRelationshipMixin('toTrackAutomationClips'),
  ReadinessMixin('isTransitionReady'), {

  title: DS.attr('string'),
  description: DS.attr('string'),
  beatCount: DS.attr('number', { defaultValue: 16 }),
  transitionClip: DS.belongsTo('mix/transition-clip'),

  fromTrackClip: Ember.computed.reads('transitionClip.fromTrackClip'),
  toTrackClip: Ember.computed.reads('transitionClip.toTrackClip'),

  fromTrackAutomationClips: DS.hasMany('mix/transition/from-track-automation-clip'),
  toTrackAutomationClips: DS.hasMany('mix/transition/to-track-automation-clip'),

  // implementing PlayableArrangement
  audioContext: Ember.computed.reads('transitionClip.audioContext'),
  outputNode: Ember.computed.reads('transitionClip.outputNode.content'),
  clips: Ember.computed.uniq('fromTrackAutomationClips', 'toTrackAutomationClips'),
  bpm: Ember.computed.reads('transitionClip.mix.bpm'),

  // optimizes this transition, with given constraints
  // TODO(REFACTOR2): rethink this. convert to ember-concurrency
  optimize({
    beatCount,
    startVolume,
    volumeControlPointCount,

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
      beatCount = isValidNumber(beatCount) ? beatCount : this.get('beatCount');


      const fromTrackVolumeClip = store.createRecord('mix/transition/from-track-automation-clip', {
        controlType: CONTROL_TYPE_VOLUME,
        transition: this,
      });
      fromTrackVolumeClip.addControlPoints(generateControlPointParams({
        startValue: startVolume,
        n: volumeControlPointCount,
        beatCount,
        direction: -1
      }));

      const toTrackVolumeClip = store.createRecord('mix/transition/to-track-automation-clip', {
        controlType: CONTROL_TYPE_VOLUME,
        transition: this,
      });
      toTrackVolumeClip.addControlPoints(generateControlPointParams({
        startValue: startVolume,
        n: volumeControlPointCount,
        beatCount,
        direction: 1
      }));

      this.get('fromTrackAutomationClips').addObject(fromTrackVolumeClip);
      this.get('toTrackAutomationClips').addObject(toTrackVolumeClip);

      this.set('beatCount', beatCount);
      return this;
    });

  },

  destroyFromTrackAutomationClips() {
    return this.get('fromTrackAutomationClips').then((fromTrackAutomationClips) => {
      return Ember.RSVP.all(fromTrackAutomationClips.toArray().map((clip) => clip.destroyRecord()));
    });
  },

  destroyToTrackAutomationClips() {
    return this.get('toTrackAutomationClips').then((toTrackAutomationClips) => {
      return Ember.RSVP.all(toTrackAutomationClips.toArray().map((clip) => clip.destroyRecord()));
    });
  },

  destroyAutomationClips() {
    return Ember.RSVP.all([
      this.destroyFromTrackAutomationClips(),
      this.destroyToTrackAutomationClips()
    ]);
  },
});

function generateControlPointParams({ startValue = 0.7, beatCount = 16, direction = 1, n = 5 }) {
  const range = _.range(0, n);
  if (direction === -1) { range.reverse(); }

  return range.map((x, i) => {
    return {
      beat: beatCount * (i / (n - 1)),
      value: startValue + (1 - startValue) * (x / (n - 1)),
    };
  });
}
