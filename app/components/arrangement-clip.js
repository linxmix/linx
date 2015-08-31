import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';

export default Ember.Component.extend(
  RequireAttributes('clipEvent', 'pxPerBeat'), {

  classNames: ['ArrangementEvent'],
  attributeBindings: ['componentStyle:style'],

  componentStyle: cssStyle({
    'left': 'startPx',
    'width': 'lengthPx',
  }),

  // params
  clipEvent: null, // set by arrangementPlayer
  arrangementItem: Ember.computed.alias('clipEvent.arrangementItem'),

  startPx: function() {
    return this.beatToPx(this.get('arrangementItem.startBeat')) + 'px';
  }.property('arrangementItem.startBeat', 'pxPerBeat'),

  endPx: function() {
    return this.beatToPx(this.get('arrangementItem.endBeat')) + 'px';
  }.property('arrangementItem.endBeat', 'pxPerBeat'),

  lengthPx: function() {
    return this.beatToPx(this.get('arrangementItem.length')) + 'px';
  }.property('arrangementItem.length', 'pxPerBeat'),

  beatToPx: function(beat) {
    return beat * this.get('pxPerBeat'); // beat * (px / beat) = px
  }
});
