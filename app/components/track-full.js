import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

const NUDGE_VALUE = 0.005;

export default Ember.Component.extend(
  RequireAttributes('track', 'store'), {

  classNames: ['TrackFull'],
  session: Ember.inject.service(),

  actions: {
    playpause: function() {
      this.toggleProperty('isPlaying');
    },

    queueTrack(track) {
      this.get('session').queueTrack(track);
    },

    analyzeTrack(track) {
      track.fetchAudioMeta();
    },

    nudgeLeft(scalar = 1) {
      this.get('beatGrid').nudge(-1.0 * scalar * NUDGE_VALUE);
    },

    nudgeRight(scalar = 1) {
      this.get('beatGrid').nudge(scalar * NUDGE_VALUE);
    },
  },

  beatGrid: Ember.computed.reads('track.audioMeta.beatGrid'),

  arrangement: Ember.computed('track', 'store', function() {
    let store = this.get('store');
    let track = this.get('track');

    if (store && track) {
      let arrangement = store.createRecord('arrangement');
      let trackClip = store.createRecord('track-clip', {
        model: track,
        startBeat: 0,
      });

      arrangement.get('trackClips').addObject(trackClip);
      return arrangement;
    }
  }),
});
