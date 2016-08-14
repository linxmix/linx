import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderPrecisionControlsTrack'],

  // required params
  clip: null,

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

    setGrid() {
      Ember.RSVP.resolve(this.get('clip')).then((clip) => {
        const beat = this.get('clip.arrangement.metronome.seekBeat');
        const time = clip.getAudioTimeFromArrangementBeat(beat);

        clip.setProperties({
          audioStartTime: time,
        });
      });
    }
  }
});

