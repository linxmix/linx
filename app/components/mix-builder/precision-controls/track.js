import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderPrecisionControlsTrack'],

  // required params
  clip: null,

  // optional params
  jumpTrackTask: null,
  jumpTrack: Ember.K,
  quantizeBeat: Ember.K,

  // internal params
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

        const audioMeta = this.get('track.audioMeta.content');
        audioMeta.set('barGridTime', time);
        // clip.setProperties({
        //   audioStartTime: time,
        // });
      });
    },

    resetDownbeat() {
      const clip = this.get('clip.content') || this.get('clip');

      const prevStartTime = clip.get('audioStartTime');
      const beatGrid = this.get('track.audioMeta.beatGrid');
      const newStartTime = beatGrid.timeToQuantizedDownbeatTime(prevStartTime);

      console.log("QUANTIZE OLD", beatGrid.timeToBar(prevStartTime))
      console.log("QUANTIZE NEW", newStartTime)

      clip.setProperties({
        audioStartTime: newStartTime,
      });
    },

    setDownbeat() {
      const audioMeta = this.get('track.audioMeta.content');

      audioMeta.set('barGridTime', this.get('clip.audioStartTime'));
    },
  }
});

