import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import ReadinessMixin from 'linx/mixins/readiness';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import {
  CONTROL_TYPE_VOLUME,
  CONTROL_TYPE_LOW_BAND,
  CONTROL_TYPE_MID_BAND,
  CONTROL_TYPE_HIGH_BAND,
  CONTROL_TYPE_DELAY_WET,
  CONTROL_TYPE_DELAY_CUTOFF,
  CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF,
  CONTROL_TYPE_FILTER_HIGHPASS_Q,
  CONTROL_TYPE_FILTER_LOWPASS_CUTOFF,
  CONTROL_TYPE_FILTER_LOWPASS_Q,
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
    isFromTrackDelayBypassed,

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
      const fromTrackLowBandClip = store.createRecord('mix/transition/from-track-automation-clip', {
        controlType: CONTROL_TYPE_LOW_BAND,
        transition: this,
      });
      const fromTrackMidBandClip = store.createRecord('mix/transition/from-track-automation-clip', {
        controlType: CONTROL_TYPE_MID_BAND,
        transition: this,
      });
      const fromTrackHighBandClip = store.createRecord('mix/transition/from-track-automation-clip', {
        controlType: CONTROL_TYPE_HIGH_BAND,
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
      const fromTrackHighpassCutoffClip = store.createRecord('mix/transition/from-track-automation-clip', {
        controlType: CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF,
        transition: this,
      });
      const fromTrackHighpassQClip = store.createRecord('mix/transition/from-track-automation-clip', {
        controlType: CONTROL_TYPE_FILTER_HIGHPASS_Q,
        transition: this,
      });
      const fromTrackLowpassCutoffClip = store.createRecord('mix/transition/from-track-automation-clip', {
        controlType: CONTROL_TYPE_FILTER_LOWPASS_CUTOFF,
        transition: this,
      });
      const fromTrackLowpassQClip = store.createRecord('mix/transition/from-track-automation-clip', {
        controlType: CONTROL_TYPE_FILTER_LOWPASS_Q,
        transition: this,
      });

      const toTrackVolumeClip = store.createRecord('mix/transition/to-track-automation-clip', {
        controlType: CONTROL_TYPE_VOLUME,
        transition: this,
      });
      const toTrackLowBandClip = store.createRecord('mix/transition/to-track-automation-clip', {
        controlType: CONTROL_TYPE_LOW_BAND,
        transition: this,
      });
      const toTrackMidBandClip = store.createRecord('mix/transition/to-track-automation-clip', {
        controlType: CONTROL_TYPE_MID_BAND,
        transition: this,
      });
      const toTrackHighBandClip = store.createRecord('mix/transition/to-track-automation-clip', {
        controlType: CONTROL_TYPE_HIGH_BAND,
        transition: this,
      });
      const toTrackHighpassCutoffClip = store.createRecord('mix/transition/to-track-automation-clip', {
        controlType: CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF,
        transition: this,
      });
      const toTrackHighpassQClip = store.createRecord('mix/transition/to-track-automation-clip', {
        controlType: CONTROL_TYPE_FILTER_HIGHPASS_Q,
        transition: this,
      });
      const toTrackLowpassCutoffClip = store.createRecord('mix/transition/to-track-automation-clip', {
        controlType: CONTROL_TYPE_FILTER_LOWPASS_CUTOFF,
        transition: this,
      });
      const toTrackLowpassQClip = store.createRecord('mix/transition/to-track-automation-clip', {
        controlType: CONTROL_TYPE_FILTER_LOWPASS_Q,
        transition: this,
      });

      const fromTrackAutomationClips = [
        fromTrackVolumeClip,
        fromTrackLowBandClip,
        fromTrackMidBandClip,
        fromTrackHighBandClip,
        fromTrackDelayWetClip,
        fromTrackDelayCutoffClip,
        fromTrackHighpassCutoffClip,
        fromTrackHighpassQClip,
        fromTrackLowpassCutoffClip,
        fromTrackLowpassQClip
      ];

      const toTrackAutomationClips = [
        toTrackVolumeClip,
        toTrackLowBandClip,
        toTrackMidBandClip,
        toTrackHighBandClip,
        toTrackHighpassCutoffClip,
        toTrackHighpassQClip,
        toTrackLowpassCutoffClip,
        toTrackLowpassQClip
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

        fromTrackLowBandClip.addControlPoints(generateControlPointParams({
          startValue: 6,
          endValue: 6,
          n: volumeControlPointCount,
          beatCount,
        }));
        fromTrackMidBandClip.addControlPoints(generateControlPointParams({
          startValue: 6,
          endValue: 6,
          n: volumeControlPointCount,
          beatCount,
        }));
        fromTrackHighBandClip.addControlPoints(generateControlPointParams({
          startValue: 6,
          endValue: 6,
          n: volumeControlPointCount,
          beatCount,
        }));

        fromTrackHighpassCutoffClip.addControlPoints(generateControlPointParams({
          startValue: 20,
          endValue: 20,
          n: volumeControlPointCount,
          beatCount,
        }));
        fromTrackHighpassQClip.addControlPoints(generateControlPointParams({
          startValue: 1,
          endValue: 1,
          n: volumeControlPointCount,
          beatCount,
        }));

        fromTrackLowpassCutoffClip.addControlPoints(generateControlPointParams({
          startValue: 22050,
          endValue: 22050,
          n: volumeControlPointCount,
          beatCount,
        }));
        fromTrackLowpassQClip.addControlPoints(generateControlPointParams({
          startValue: 1,
          endValue: 1,
          n: volumeControlPointCount,
          beatCount,
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
            value: 20,
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

        toTrackLowBandClip.addControlPoints(generateControlPointParams({
          startValue: 6,
          endValue: 6,
          n: volumeControlPointCount,
          beatCount,
        }));
        toTrackMidBandClip.addControlPoints(generateControlPointParams({
          startValue: 6,
          endValue: 6,
          n: volumeControlPointCount,
          beatCount,
        }));
        toTrackHighBandClip.addControlPoints(generateControlPointParams({
          startValue: 6,
          endValue: 6,
          n: volumeControlPointCount,
          beatCount,
        }));

        toTrackHighpassCutoffClip.addControlPoints(generateControlPointParams({
          startValue: 20,
          endValue: 20,
          n: volumeControlPointCount,
          beatCount,
        }));
        toTrackHighpassQClip.addControlPoints(generateControlPointParams({
          startValue: 1,
          endValue: 1,
          n: volumeControlPointCount,
          beatCount,
        }));

        toTrackLowpassCutoffClip.addControlPoints(generateControlPointParams({
          startValue: 22050,
          endValue: 22050,
          n: volumeControlPointCount,
          beatCount,
        }));
        toTrackLowpassQClip.addControlPoints(generateControlPointParams({
          startValue: 1,
          endValue: 1,
          n: volumeControlPointCount,
          beatCount,
        }));

        if (isFromTrackDelayBypassed) {
          this.set('fromTrackClip.delayBypass', true);
        }

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
