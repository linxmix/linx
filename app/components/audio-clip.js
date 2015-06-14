import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttributes('model', 'isPlaying', 'seekTime', 'metronome'), {

  classNames: ['AudioClip'],

  actions: {
    didLoadWave: function() {
      this.get('model').set('isAudioLoaded', true);
    }
  }
});
