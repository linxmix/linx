import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';

export default Ember.Component.extend(
  RequireAttributes('clipEvent', 'pxPerBeat'), {

  classNames: ['ArrangementClip'],
  attributeBindings: ['componentStyle:style'],

  componentStyle: cssStyle({
    'left': 'startPx',
    'width': 'lengthPx',
  }),

  // params
  arrangementClip: Ember.computed.alias('clipEvent.arrangementClip'),

  startPx: function() {
    return this.beatToPx(this.get('arrangementClip.startBeat')) + 'px';
  }.property('arrangementClip.startBeat', 'pxPerBeat'),

  endPx: function() {
    return this.beatToPx(this.get('arrangementClip.endBeat')) + 'px';
  }.property('arrangementClip.endBeat', 'pxPerBeat'),

  lengthPx: function() {
    return this.beatToPx(this.get('arrangementClip.length')) + 'px';
  }.property('arrangementClip.length', 'pxPerBeat'),

  beatToPx: function(beat) {
    return beat * this.get('pxPerBeat'); // beat * (px / beat) = px
  }
});
