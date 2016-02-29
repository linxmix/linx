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
  ReadinessMixin('isTransitionReady'), {

  title: DS.attr('string'),
  description: DS.attr('string'),
  transitionClip: DS.belongsTo('mix/transition-clip'),

  // implementing PlayableArrangement
  outputNode: Ember.computed.reads('mixItem.mix.outputNode'),
  clips: Ember.computed.reads('automationClips'), // TODO(POLYMORHPISM)

  // optimizes this transition, with given constraints
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
      fromTrack = fromTrack || this.get('fromTrack.content');
      toTrack = toTrack || this.get('toTrack.content');

      Ember.assert('Must have fromTrack and toTrack to optimizeTransition', Ember.isPresent(fromTrack) && Ember.isPresent(toTrack));

      return Ember.RSVP.all([
        fromTrack.get('readyPromise'),
        toTrack.get('readyPromise'),
      ]).then(() => {

        // TODO(TRANSITION): improve this algorithm, add options and presets

        return this;
      });

    });
  },
});
