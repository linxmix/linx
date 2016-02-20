import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from 'linx/mixins/readiness';
import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many/item';
import TrackPropertiesMixin from 'linx/mixins/models/transition/track-properties';
import withDefaultModel from 'linx/lib/computed/with-default-model';
import { isNumber } from 'linx/lib/utils';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';
import concat from 'linx/lib/computed/concat';

export default DS.Model.extend(
  PlayableArrangementMixin,
  ReadinessMixin('isTransitionReady'),
  TrackPropertiesMixin('fromTrack'),
  TrackPropertiesMixin('toTrack'), {

  fromTrackAutomationClips: Ember.computed(function() {
    return [this.store.createRecord('transition/track-automation-clip', {
      transition: this,
      controlName: 'volume',
    })];
  }),

  toTrackAutomationClips: Ember.computed(function() {
    return [this.store.createRecord('transition/track-automation-clip', {
      transition: this,
      controlName: 'volume',
    })];
  }),

  title: DS.attr('string'),
  mixItem: DS.belongsTo('mix/item', { async: true }),
  beatCount: DS.attr('number', { defaultValue: 16 }),

  // implement readiness
  isTransitionReady: Ember.computed.and('fromTrackIsReady', 'toTrackIsReady'),
  // TODO(CLEANUP): computed property? relIsLoaded? rel.isPending ? false : rel.isFulfilled
  fromTrackIsReady: Ember.computed('fromTrack.isPending', 'fromTrack.isFulfilled', function() {
    let fromTrack = this.get('fromTrack');

    return fromTrack.get('isPending') ? false : fromTrack.get('isFulfilled');
  }),
  toTrackIsReady: Ember.computed('toTrack.isPending', 'toTrack.isFulfilled', function() {
    let toTrack = this.get('toTrack');

    return toTrack.get('isPending') ? false : toTrack.get('isFulfilled');
  }),

  // implement playable-arrangement
  mix: Ember.computed.reads('mixItem.mix'),
  endBeat: Ember.computed.reads('beatCount'),
  automationClips: concat('fromTrackAutomationClips', 'toTrackAutomationClips'),
  clips: Ember.computed.reads('automationClips'),
  outputNode: Ember.computed.reads('mix.inputNode'),
  metronome: Ember.computed.reads('mix.metronome'),
  audioContext: Ember.computed.reads('mix.audioContext'),

  // optimizes this model as a transition between two tracks, with given constraints
  // possible constraints:
  // {
  //   fromTrack,
  //   toTrack,
  //   preset,
  //   minFromTrackEndBeat,
  //   maxToTrackStartBeat,
  //   fromTrackEnd,
  //   toTrackStart,
  // }
  optimize(options = {}) {
    let {
      fromTrack,
      toTrack,
      preset,
      minFromTrackEndBeat,
      maxToTrackStartBeat,
      fromTrackEnd,
      toTrackStart,
    } = options;

    return this.get('readyPromise').then(() => {
      fromTrack = fromTrack || this.get('fromTrack.content');
      toTrack = toTrack || this.get('toTrack.content');

      Ember.assert('Must have fromTrack and toTrack to optimizeTransition', Ember.isPresent(fromTrack) && Ember.isPresent(toTrack));

      return Ember.RSVP.all([
        fromTrack.get('readyPromise'),
        toTrack.get('readyPromise'),
      ]).then(() => {

        // update tracks
        this.setProperties({
          fromTrack,
          toTrack,
        });

        // TODO(TRANSITION): improve this algorithm, add options and presets
        // update markers
        this.setProperties({
          fromTrackEndBeat: fromTrack.get('audioMeta.lastWholeBeat'),
          toTrackStartBeat: toTrack.get('audioMeta.firstWholeBeat'),
          beatCount: 16,
        });

        return this;
      });

    });
  },
});
