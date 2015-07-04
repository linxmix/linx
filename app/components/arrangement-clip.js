import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';

// TODO: figure this out
export const PX_PER_BEAT = 20;

export default Ember.Component.extend(
  RequireAttributes('clipEvent'), {

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
  }.property('arrangementClip.startBeat'),

  endPx: function() {
    return this.beatToPx(this.get('arrangementClip.endBeat')) + 'px';
  }.property('arrangementClip.endBeat'),

  lengthPx: function() {
    return this.beatToPx(this.get('arrangementClip.length')) + 'px';
  }.property('arrangementClip.length'),

  beatToPx: function(beat) {
    return beat * PX_PER_BEAT; // beat * (px / beat) = px
  }
});
