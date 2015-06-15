import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';

export default Ember.Component.extend(
  RequireAttributes('model', 'metronome'), {

  classNames: ['ArrangementClip'],

  attributeBindings: ['componentStyle:style'],

  componentStyle: cssStyle({
    'left': 'startPx',
  }),

  startPx: function() {
    // TODO: fix with hack fix
    console.log("startPx", (this.beatToPx(this.get('model.startBeat')) - this.timeToPx(this.get('model.clip.startTime'))))
    var item = this.beatToPx(this.get('model.startBeat'));
    var clip = this.timeToPx(this.get('model.clip.startTime'));
    var px = item - clip;
    return px + 'px';
  }.property('model.startBeat', 'model.clip.startTime'),

  beatToPx: function(beat) {
    var spb = this.get('metronome.spb');
    return ((beat - 1) * spb * 20); // b * (s / b) * (px / s) = px
  },

  timeToPx: function(time) {
    return time * 20; // s * (px / s) = px
  }
});
