import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from 'linx/mixins/readiness';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';
import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many/item';
import TrackPropertiesMixin from 'linx/mixins/models/transition/track-properties';
import withDefaultModel from 'linx/lib/computed/with-default-model';
import { isNumber } from 'linx/lib/utils';

export default DS.Model.extend(
  DependentRelationshipMixin('arrangement'),
  ReadinessMixin('isTransitionReady'),
  TrackPropertiesMixin('fromTrack'),
  TrackPropertiesMixin('toTrack'), {

  title: DS.attr('string'),
  mixItems: DS.hasMany('mix/item', { async: true }),
  beatCount: Ember.computed.reads('arrangement.beatCount'),

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

  // the transition's arrangement
  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    // TODO: have to fake title for Firebase to accept record
    let arrangement = this.get('store').createRecord('arrangement', {
      title: 'test title'
    });
    return arrangement;
  }),

  // TODO(TRANSITION): fix this
  setTransitionBeatCount(beatCount) {
    this.get('arrangement.clips.lastObject').set('beatCount', beatCount);
  },

  // TODO(REFACTOR): this will change (i hope)
  // create partial mix with fromTrack, transition, toTrack
  generateMix() {
    return DS.PromiseObject.create({
      promise: this.get('readyPromise').then(() => {
        let mix = this.get('store').createRecord('mix');
        mix.appendTransition(this);
        return mix;
      }),
    });
  },

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
        });

        // TODO(REFACTOR): do we need to destroy and recreate arrangement / automation-clip?
        let arrangement = this.get('arrangement.content');
        let automationClip = this.get('store').createRecord('arrangement/automation-clip', {
          beatCount: 16,
        });
        arrangement.get('automationClips').addObject(automationClip);

        return this;
      });

    });
  },
});
