import Ember from 'ember';

import { isValidNumber } from 'linx/lib/utils';

export default Ember.Component.extend({
  classNames: ['MixBuilderHeader'],

  // required params
  mix: null,
  mixSaveTask: null,
  mixRecordTask: null,
  saveMix: Ember.K,
  recordMix: Ember.K,
  stopRecord: Ember.K,
  newTrackPosition: 0,

  actions: {
    saveMix() {
      this.get('saveMix')();
    },

    destroyMix() {
      this.sendAction('destroyMix');
    }
  },

  // params
  store: Ember.inject.service(),
  searchTracks: Ember.computed(function() {
    return this.get('store').findAll('track');
  }),

  durationText: Ember.computed('mix.duration', function() {
    const duration = this.get('mix.duration');
    return msToTime(isValidNumber(duration) ? duration : 0);
  }),
});

function msToTime(duration) {
  let seconds = parseInt((duration)%60);
  let minutes = parseInt((duration/60)%60);
  let hours = parseInt((duration/(60*60))%24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return hours + 'h  ' + minutes + 'm  ' + seconds + 's';
}
