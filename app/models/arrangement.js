import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from 'linx/mixins/readiness';

import isEvery from 'linx/lib/computed/is-every';
import withDefault from 'linx/lib/computed/with-default';
import concat from 'linx/lib/computed/concat';

export default DS.Model.extend(
  ReadinessMixin('isArrangementReady'), {

  // TODO(POLYMORPHISM)
  trackClips: DS.hasMany('track-clip', { async: true }),
  transitionClips: DS.hasMany('transition-clip', { async: true }),
  mixClips: DS.hasMany('mix-clip', { async: true }),
  automationClips: DS.hasMany('automation-clip', { async: true }),

  isArrangementReady: Ember.computed.and('_hasManiesAreFulfilled', '_clipsAreReady'),

  _clipsAreReady: isEvery('clips', 'isReady', true),
  _hasManiesAreFulfilled: Ember.computed.and('trackClips.isFulfilled', 'transitionClips.isFulfilled', 'mixClips.isFulfilled', 'automationClips.isFulfilled'),

  clips: Ember.computed(() => { return []; }),
  updateClips: function() {
    if (this.get('_hasManiesAreFulfilled')) {
      Ember.run.next(() => {
        Ember.run.once(this, '_updateClips');
      });
    }
  }.observes('_hasManiesAreFulfilled', 'trackClips.[]', 'transitionClips.[]', 'mixClips.[]', 'automationClips.[]'),

  _updateClips: function() {
    let keys = ['trackClips', 'transitionClips', 'mixClips', 'automationClips'];

    if (!this.get('isDestroyed')) {
      this.set('clips', keys.reduce((acc, key) => {
        let hasMany = this.get(`${key}.content`);
        return acc.concat(hasMany ? hasMany.toArray() : []);
      }, []));
    }

    console.log("updateClips", this.get('clips'));
  },

  // params
  readyClips: Ember.computed.filterBy('clips', 'isReady', true),

  clipSort: ['endBeat:asc'],
  sortedClips: Ember.computed.sort('clips', 'clipSort'),
  lastBeat: Ember.computed.reads('sortedCips.lastObject.lastBeat'),
  numBeats: withDefault('lastBeat', 0),

  // TODO(CLEANUP): destroy clips when destroying arrangement?
});
