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
  isTransitionReady: Ember.computed.and('fromTrack.isReady', 'toTrack.isReady'),

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
    return this.get('readyPromise').then(() => {
      let { fromTrack, toTrack } = options;
      fromTrack = fromTrack || this.get('fromTrack.content');
      toTrack = toTrack || this.get('toTrack.content');

      Ember.assert('Must have fromTrack and toTrack to optimizeTransition', Ember.isPresent(fromTrack) && Ember.isPresent(toTrack));

      return Ember.RSVP.all([
        fromTrack.get('readyPromise'),
        toTrack.get('readyPromise'),
      ]).then(() => {

        let {
          preset,
          minFromTrackEndBeat,
          maxToTrackStartBeat,
          fromTrackEnd,
          toTrackStart,
        } = options;

        // TODO(TRANSITION): improve this algorithm, add options and presets
        this.set('fromTrackEndBeat', fromTrack.get('audioMeta.lastWholeBeat'));
        this.set('toTrackStartBeat', toTrack.get('audioMeta.firstWholeBeat'));

        // TODO(REFACTOR): do we need to destroy and recreate arrangement / automation-clip?
        let arrangement = this.get('arrangement.content');
        let automationClip = this.get('store').createRecord('arrangement/automation-clip', {
          beatCount: 16,
        });
        arrangement.get('automationClips').addObject(automationClip);

        return this;
        // TODO(REFACTOR): does it makes sense to save here? probably not, so we can revert
        // return arrangement.save().then(() => {
        //   return automationClip.save().then(() => {
        //     return this;
        //   });
        // });
      });

    })
  },
});
