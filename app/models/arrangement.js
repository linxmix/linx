import Ember from 'ember';
import DS from 'ember-data';

import isEvery from 'linx/lib/computed/is-every';
import withDefault from 'linx/lib/computed/with-default';
import concat from 'linx/lib/computed/concat';

export default DS.Model.extend({
  mixes: DS.hasMany('mix', { async: true }),

  // TODO(POLYMORPHISM)
  clips: concat('trackClips', 'transitionClips', 'mixClips', 'automationClips'),
  trackClips: DS.hasMany('track-clip', { async: true, defaultValue: () => [] }),
  transitionClips: DS.hasMany('transition-clip', { async: true, defaultValue: () => [] }),
  mixClips: DS.hasMany('mix-clip', { async: true, defaultValue: () => [] }),
  automationClips: DS.hasMany('automation-clip', { async: true, defaultValue: () => [] }),

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
