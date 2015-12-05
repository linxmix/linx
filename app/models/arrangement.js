import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from 'linx/mixins/readiness';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import isEvery from 'linx/lib/computed/is-every';
import withDefault from 'linx/lib/computed/with-default';
import concat from 'linx/lib/computed/concat';
import { copyInPlace } from 'linx/lib/utils';

export default DS.Model.extend(
  PlayableArrangementMixin,
  DependentRelationshipMixin('clips'),
  ReadinessMixin('isArrangementReady'), {

  // TODO(FIREBASE): remove fake title which makes sure arrangement saves
  title: DS.attr('string', { defaultValue: 'placeholder title' }),
  timeSignature: DS.attr('number', { defaultValue: 4.0 }),

  // implement playable-arrangement
  session: Ember.inject.service(),
  audioContext: Ember.computed.reads('session.audioContext'),

  // TODO(POLYMORPHISM)
  trackClips: DS.hasMany('arrangement/track-clip', { async: true }),
  // transitionClips: DS.hasMany('arrangement/transition-clip', { async: true }),
  // mixClips: DS.hasMany('mix-clip', { async: true }),
  automationClips: DS.hasMany('arrangement/automation-clip', { async: true }),

  isArrangementReady: Ember.computed.bool('_hasManiesAreFulfilled'),

  // _hasManiesAreFulfilled: Ember.computed.and('trackClips.isFulfilled', 'transitionClips.isFulfilled', 'mixClips.isFulfilled', 'automationClips.isFulfilled'),
  _hasManiesAreFulfilled: Ember.computed.and('trackClips.isFulfilled', 'automationClips.isFulfilled'),

  clips: Ember.computed(() => { return []; }),
  updateClips: function() {
    if (this.get('_hasManiesAreFulfilled')) {
      Ember.run.once(this, '_updateClips');
    }
  }.observes('_hasManiesAreFulfilled', 'trackClips.[]', 'transitionClips.[]', 'mixClips.[]', 'automationClips.[]'),

  _updateClips: function() {
    let keys = ['trackClips', 'transitionClips', 'mixClips', 'automationClips'];

    if (!this.get('isDestroyed')) {
      let clips = this.get('clips');

      // figure out what clips should look like
      let newClips = keys.reduce((acc, key) => {
        let hasMany = this.get(`${key}.content`);
        hasMany = hasMany ? hasMany.toArray() : [];

        return acc.concat(hasMany);
      }, []);

      copyInPlace(clips, newClips);
    }
  }
});
