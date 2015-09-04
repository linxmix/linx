import Ember from 'ember';
import DS from 'ember-data';

import isEvery from 'linx/lib/computed/is-every';
import withDefault from 'linx/lib/computed/with-default';
import concat from 'linx/lib/computed/concat';

export default DS.Model.extend({
  mixes: DS.hasMany('mix', { async: true }),

  // TODO(POLYMORPHISM)
  trackClips: DS.hasMany('track-clip', { async: true }),
  transitionClips: DS.hasMany('transition-clip', { async: true }),
  mixClips: DS.hasMany('mix-clip', { async: true }),
  automationClips: DS.hasMany('automation-clip', { async: true }),

  _hasManiesAreFulfilled: Ember.computed.and('trackClips.isFulfilled', 'transitionClips.isFulfilled', 'mixClips.isFulfilled', 'automationClips.isFulfilled'),

  clips: Ember.computed(() => { return [] }),
  updateClips: function() {
    if (this.get('isLoaded') && this.get('_hasManiesAreFulfilled')) {
      Ember.run.next(() => {
        Ember.run.once(this, '_updateClips');
      });
    }
  }.observes('isLoaded', '_hasManiesAreFulfilled', 'trackClips.[]', 'transitionClips.[]', 'mixClips.[]', 'automationClips.[]'),

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
  validClips: Ember.computed.filterBy('clips', 'isValid', true),

  isReady: isEvery('clips', 'isReady', true),

  clipSort: ['endBeat:asc'],
  sortedClips: Ember.computed.sort('clips', 'clipSort'),
  lastBeat: Ember.computed.reads('sortedCips.lastObject.lastBeat'),
  numBeats: withDefault('lastBeat', 0),

  // TODO(CLEANUP): destroy clips when destroying arrangement?

  save: function() {
    let promise = this._super.apply(this, arguments);
    console.log('save arrangement', promise);
    return promise;
  }
});


  // _updateClips = function(arrangement) {
  //   var keys = ['trackClips', 'transitionClips', 'mixClips', 'automationClips'];

  //   arrangement.set('clips', keys.reduce(function(acc, key) {
  //     var hasMany = arrangement.get(key + '.content');
  //     return acc.concat(hasMany ? hasMany.toArray() : []);
  //   }, []));

  //   console.log("updateClips", arrangement.get('clips'));
  // }
