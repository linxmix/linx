import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';

// TODO: figure this out
export const PX_PER_SEC = 20;

export default Ember.Component.extend(
  RequireAttributes('model', 'metronome'), {

  classNames: ['ArrangementClip'],

  attributeBindings: ['componentStyle:style'],

  componentStyle: cssStyle({
    'left': 'startPx',
    'width': 'lengthPx',
  }),

  startPx: function() {
    return this.beatToPx(this.get('model.startBeat')) + 'px';
  }.property('model.startBeat'),

  endPx: function() {
    return this.beatToPx(this.get('model.endBeat')) + 'px';
  }.property('model.endBeat'),

  lengthPx: function() {
    console.log("length", this.get('model.length'));
    return this.beatToPx(this.get('model.length')) + 'px';
  }.property('model.length'),

  beatToPx: function(beat) {
    var spb = this.get('metronome.spb');
    return (beat * spb * PX_PER_SEC); // b * (s / b) * (px / s) = px
  },

  timeToPx: function(time) {
    return time * PX_PER_SEC; // s * (px / s) = px
  }
});
