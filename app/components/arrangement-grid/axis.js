import Ember from 'ember';
import d3 from 'd3';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import cssStyle from 'linx/lib/computed/css-style';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('arrangement', 'pxPerBeat'), {

  actions: {},
  classNames: ['ArrangementGridAxis'],
  classNameBindings: [],
  attributeBindings: ['componentStyle:style'],

  // TODO(REFACTOR): figure out playhead
  // playheadStyle: cssStyle({
  //   'left': 'playheadPx'
  // }),

  // playheadPx: function() {
  //   return (this.get('metronome.tickBeat') * this.get('pxPerBeat')) + 'px';
  // }.property('metronome.tickBeat', 'pxPerBeat'),

  arrangementWidth: function() {
    return this.get('arrangement.beatCount') * this.get('pxPerBeat');
  }.property('arrangement.beatCount', 'pxPerBeat'),

  arrangementWidthStyle: Ember.computed('arrangementWidth', function() {
    return `${this.get('arrangementWidth')}px`;
  }),

  componentStyle: cssStyle({
    width: 'arrangementWidthStyle'
  }),

  barCount: Ember.computed.reads('arrangement.barCount'),
  barScale: Ember.computed('arrangementWidth', 'barCount', function () {
    let rangeMax = this.get('arrangementWidth');
    let domainMax = this.get('barCount');

    return d3.scale.linear().domain([1, domainMax + 1]).range([0, rangeMax]);
  }).readOnly(),

  // scale ticks based on zoom
  ticksOnScreen: 10,
  barTicks: Ember.computed('arrangementWidth', 'ticksOnScreen', function() {
    let ticksOnScreen = this.get('ticksOnScreen');
    let viewWidth = this._getParentWidth(); // TODO: update on resize
    let arrangementWidth = this.get('arrangementWidth');

    let ticks = ticksOnScreen * (arrangementWidth / viewWidth);
    return ticks;
  }),

  _getParentWidth() {
    let parentView = this.get('parentView');

    if (parentView.get('isInDom')) {
      return parentView.$().width();
    }
  },
});
