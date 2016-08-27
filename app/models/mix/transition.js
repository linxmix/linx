import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import ReadinessMixin from 'linx/mixins/readiness';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import {
  CONTROL_TYPE_VOLUME,
  CONTROL_TYPE_DELAY_WET,
  CONTROL_TYPE_DELAY_CUTOFF
} from 'linx/mixins/playable-arrangement/automatable-clip/control';
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
      const fromTrackDelayWetClip = store.createRecord('mix/transition/from-track-automation-clip', {
        controlType: CONTROL_TYPE_DELAY_WET,
        transition: this,
      });
      const fromTrackDelayCutoffClip = store.createRecord('mix/transition/from-track-automation-clip', {
        controlType: CONTROL_TYPE_DELAY_CUTOFF,
        transition: this,
      });
      const toTrackVolumeClip = store.createRecord('mix/transition/to-track-automation-clip', {
        controlType: CONTROL_TYPE_VOLUME,
        transition: this,
      });

      const fromTrackAutomationClips = [
        fromTrackVolumeClip,
        fromTrackDelayWetClip,
        fromTrackDelayCutoffClip
      ];

      const toTrackAutomationClips = [
        toTrackVolumeClip
      ];

      const clips = fromTrackAutomationClips.concat(toTrackAutomationClips);

      // TODO(TECHDEBT): save automation clips BEFORE adding items. otherwise, we get a weird bug
      // where control points are removed from relationship while saving, if only one has changed
      // - not due to orderedHasMany
      return Ember.RSVP.all(clips.invoke('save')).then(() => {
        fromTrackVolumeClip.addControlPoints(generateControlPointParams({
          startValue: startVolume,
          n: volumeControlPointCount,
          beatCount,
          direction: -1
        }));

        fromTrackDelayWetClip.addControlPoints([
          {
            beat: 0,
            value: 0,
          },
          {
            beat: 3 * (beatCount / 4),
            value: 0,
          },
          {
            beat: beatCount,
            value: 0.8
          }
        ]);

        fromTrackDelayCutoffClip.addControlPoints([
          {
            beat: 0,
            value: 0,
          },
          {
            beat: 3 * (beatCount / 4),
            value: 10000,
          },
          {
            beat: beatCount,
            value: 2000,
          }
        ]);

        toTrackVolumeClip.addControlPoints(generateControlPointParams({
          startValue: startVolume,
          n: volumeControlPointCount,
          beatCount,
          direction: 1
        }));

        this.get('fromTrackAutomationClips').addObjects(fromTrackAutomationClips);
        this.get('toTrackAutomationClips').addObjects(toTrackAutomationClips);

        this.set('beatCount', beatCount);
        return this;
      });
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

function generateControlPointParams({ startValue = 0.7, endValue = 1, beatCount = 16, direction = 1, n = 5 }) {
  const range = _.range(0, n);
  if (direction === -1) { range.reverse(); }

  return range.map((x, i) => {
    return {
      beat: beatCount * (i / (n - 1)),
      value: startValue + (endValue - startValue) * (x / (n - 1)),
    };
  });
}
