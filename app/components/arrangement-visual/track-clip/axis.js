import Ember from 'ember';
import d3 from 'd3';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import multiply from 'linx/lib/computed/multiply';
import toPixels from 'linx/lib/computed/to-pixels';
import cssStyle from 'linx/lib/computed/css-style';
import { clamp } from 'linx/lib/utils';

const MAX_BEATS_ON_SCREEN = 100;
const MAX_BARS_ON_SCREEN = MAX_BEATS_ON_SCREEN;

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('clip', 'pxPerBeat'), {

  actions: {},
  classNames: ['TrackClipAxis'],
  classNameBindings: [],
  // TODO: is this necessary?
  // attributeBindings: ['componentStyle:style'],

  track: Ember.computed.reads('clip.track'),
  beatCount: Ember.computed.reads('clip.beatCount'),
  audioStartBeat: Ember.computed.reads('clip.audioStartBeat'),
  audioEndBeat: Ember.computed.reads('clip.audioEndBeat'),

  audioStartBar: Ember.computed.reads('clip.audioStartBar'),
  audioEndBar: Ember.computed.reads('clip.audioEndBar'),
  barCount: Ember.computed.reads('clip.barCount'),

  showBeatGrid: Ember.computed.and('clipWidth', 'beatCountOnScreenIsValid'),
  beatCountOnScreenIsValid: Ember.computed.lte('beatCountOnScreen', MAX_BEATS_ON_SCREEN),

  showBarGrid: Ember.computed.and('clipWidth', 'barCountOnScreenIsValid'),
  barCountOnScreenIsValid: Ember.computed.lte('barCountOnScreen', MAX_BARS_ON_SCREEN),

  beatCountOnScreen: Ember.computed('clipWidth', 'beatCount', 'arrangementViewWidth', function() {
    let {
      beatCount,
      arrangementViewWidth,
      clipWidth,
    } = this.getProperties('clipWidth', 'beatCount', 'arrangementViewWidth');

    return (arrangementViewWidth / clipWidth) * beatCount;
  }),
  barCountOnScreen: multiply('beatCountOnScreen', 0.25),

  clipWidth: multiply('beatCount', 'pxPerBeat'),
  clipWidthStyle: toPixels('clipWidth'),

  componentStyle: cssStyle({
    width: 'clipWidthStyle',
  }),

  // TODO(MULTIGRID): these will need piecewise scales or something
  beatViewScale: Ember.computed('clipWidth', 'audioStartBeat', 'audioEndBeat', function() {
    let {
      clipWidth: rangeMax,
      audioStartBeat: domainMin,
      audioEndBeat: domainMax,
    } = this.getProperties('clipWidth', 'audioStartBeat', 'audioEndBeat');

    return d3.scale.linear().domain([domainMin, domainMax]).range([0, rangeMax]);
  }).readOnly(),

  barViewScale: Ember.computed('clipWidth', 'audioStartBar', 'audioEndBar', function() {
    let {
      clipWidth: rangeMax,
      audioStartBar: domainMin,
      audioEndBar: domainMax,
    } = this.getProperties('clipWidth', 'audioStartBar', 'audioEndBar');

    return d3.scale.linear().domain([domainMin, domainMax]).range([0, rangeMax]);
  }).readOnly(),

  // TODO: make less brittle (?)
  // TODO: update on window.resize
  arrangementView: Ember.computed.reads('parentView.parentView.parentView'),
  arrangementViewWidth: Ember.computed('arrangementView.isInDom', function() {
    let arrangementView = this.get('arrangementView');

    if (arrangementView && arrangementView.get('isInDom')) {
      return arrangementView.$().width();
    }
  }),
});
