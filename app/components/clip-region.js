import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('pxPerBeat'), {

  actions: {},
  classNames: ['ClipRegion'],
  classNameBindings: [],
  attributeBindings: ['componentStyle:style'],

  // optional params
  startBeat: 0,
  endBeat: 0,
  minWidthPx: 2,
  color: 'rgba(0,150,0,1)',
  length: function() {
    var endBeat = this.get('endBeat')
    var startBeat = this.get('startBeat')
    if (endBeat) {
      return endBeat - startBeat;
    } else {
      return 0;
    }
  }.property('startBeat', 'endBeat'),

  componentStyle: cssStyle({
    'left': 'startPx',
    'width': 'lengthPx',
    'background-color': 'color'
  }),

  startPx: function() {
    return (this.get('startBeat') * this.get('pxPerBeat')) + 'px';
  }.property('startBeat', 'pxPerBeat'),

  lengthPx: function() {
    var lengthPx = this.get('length') * this.get('pxPerBeat');
    return Math.max(this.get('minWidthPx'), lengthPx) + 'px';
  }.property('length', 'pxPerBeat', 'minWidthPx'),
});

