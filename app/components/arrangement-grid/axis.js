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

  playheadStyle: cssStyle({
    'left': 'playheadPx'
  }),

  playheadPx: function() {
    return (this.get('metronome.tickBeat') * this.get('pxPerBeat')) + 'px';
  }.property('metronome.tickBeat', 'pxPerBeat'),

  arrangementWidth: function() {
    return this.get('arrangement.numBeats') * this.get('pxPerBeat');
  }.property('arrangement.numBeats', 'pxPerBeat'),

  arrangementWidthStyle: Ember.computed('arrangementWidth', function() {
    return `${this.get('arrangementWidth')}px`;
  }),

  componentStyle: cssStyle({
    width: 'arrangementWidthStyle'
  }),

  numBars: Ember.computed.reads('arrangement.numBars'),
  barScale: Ember.computed('arrangementWidth', 'numBars', function () {
    let rangeMax = this.get('arrangementWidth');
    let domainMax = this.get('numBars');

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
    return this.get('parentView').$().width();
  },
});
