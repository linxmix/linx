import Ember from 'ember';
import d3 from 'd3';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import cssStyle from 'linx/lib/computed/css-style';
import { clamp } from 'linx/lib/utils';

const MAX_BEATS_ON_SCREEN = 100;

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('clip', 'pxPerBeat', 'beatgridOffset'), {

  actions: {},
  classNames: ['TrackClipAxis'],
  classNameBindings: [],
  attributeBindings: ['componentStyle:style'],

  track: Ember.computed.reads('clip.track'),
  numBeats: Ember.computed.reads('clip.numBeats'),
  clipStartBeat: Ember.computed.reads('clip.clipStartBeat'),
  clipEndBeat: Ember.computed.reads('clip.clipEndBeat'),

  showBeatGrid: Ember.computed.and('clipWidth', 'numBeatsOnScreenIsValid'),
  numBeatsOnScreenIsValid: Ember.computed.lte('numBeatsOnScreen', MAX_BEATS_ON_SCREEN),

  numBeatsOnScreen: Ember.computed('clipWidth', 'numBeats', function() {
    let numBeats = this.get('numBeats');
    let viewWidth = this._getArrangementViewWidth(); // TODO: update on resize
    let clipWidth = this.get('clipWidth');

    return (viewWidth / clipWidth) * numBeats;
  }),

  clipWidth: function() {
    return this.get('numBeats') * this.get('pxPerBeat');
  }.property('numBeats', 'pxPerBeat'),

  clipWidthStyle: Ember.computed('clipWidth', function() {
    return `${this.get('clipWidth')}px`;
  }),

  beatgridOffsetStyle: function() {
    return `${this.get('beatgridOffset')}px`;
  }.property('beatgridOffset'),

  componentStyle: cssStyle({
    width: 'clipWidthStyle',
    right: 'beatgridOffsetStyle'
  }),

  beatScale: Ember.computed('clipWidth', 'clipStartBeat', 'clipEndBeat', function () {
    let rangeMax = this.get('clipWidth');
    let domainMin = this.get('clipStartBeat');
    let domainMax = this.get('clipEndBeat');

    return d3.scale.linear().domain([domainMin, domainMax]).range([0, rangeMax]);
  }).readOnly(),

  _getArrangementViewWidth() {
    let arrangementView = this.get('parentView.parentView.parentView');

    if (arrangementView && arrangementView.get('isInDom')) {
      return arrangementView.$().width();
    }
  },
});
