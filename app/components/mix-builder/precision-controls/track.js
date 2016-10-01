import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderPrecisionControlsTrack'],

  // required params
  clip: null,
  isFromTrackClip: false,
  isToTrackClip: false,

  // optional params
  jumpTrackTask: null,
  jumpTrack: Ember.K,
  quantizeBeat: Ember.K,

  track: Ember.computed.reads('clip.track'),
  beatDetection: Ember.inject.service(),

  actions: {
    analyzeTrack() {
      const task = this.get('beatDetection.analyzeTrackTask');
      const track = this.get('track');
      task.perform(track).then(({ peaks, intervals }) => {
        const trackClip = this.get('clip');

        console.log('analyze track markers', peaks, intervals);
        trackClip.setProperties({
          markers: peaks,
          // audioStartTime: peaks[0].time,
        });
      });
    },

    moveTransition() {
      Ember.RSVP.resolve(this.get('clip')).then((clip) => {
        const beat = this.get('clip.arrangement.metronome.seekBeat');

        if (this.get('isFromTrackClip')) {
          clip.set('audioEndTime', clip.getAudioTimeFromArrangementBeat(beat));
        } else {
          // this code was to allow moving transition to end beat
          // const transitionBeatCount = this.get('clip.mixItem.transition.beatCount');
          // const time = clip.getAudioTimeFromArrangementBeat(beat - transitionBeatCount);
          clip.set('audioStartTime', clip.getAudioTimeFromArrangementBeat(beat));
        }
      });
    }
  }
});

