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

  actions: {
    analyzeTrack() {
      const analyzeTask = this.get('track.analyzeTask');
      analyzeTask.perform();
    },

    moveTransition() {
      Ember.RSVP.resolve(this.get('clip')).then((clip) => {
        const beat = this.get('clip.arrangement.metronome.seekBeat');

        if (this.get('isFromTrackClip')) {
          clip.set('audioEndTime', clip.getAudioTimeFromArrangementBeat(beat));
        } else {
          const transitionBeatCount = this.get('clip.mixItem.transition.beatCount');
          const time = clip.getAudioTimeFromArrangementBeat(beat - transitionBeatCount);
          clip.set('audioStartTime', time);
        }
      });
    }
  }
});

