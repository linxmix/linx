import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'ember-cli-d3/mixins/d3-support';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';
import { isValidNumber } from 'linx/lib/utils';

export default Ember.Component.extend(
  GraphicSupport, BubbleActions(), RequireAttributes('arrangement'), {

  // optional params
  width: null,
  height: null,

  beatCount: Ember.computed.reads('arrangement.beatCount'),
  beatScale: Ember.computed('beatCount', function () {
    // let rangeMax = this.get('arrangementWidth');
    let domainMax = this.get('beatCount');

    return d3.scale.linear().domain([1, domainMax + 1]).range([0, domainMax]);
  }).readOnly(),

  // // scale ticks based on zoom
  // ticksOnScreen: 10,
  // barTicks: Ember.computed('arrangementWidth', 'ticksOnScreen', function() {
  //   let ticksOnScreen = this.get('ticksOnScreen');
  //   let viewWidth = this._getParentWidth(); // TODO: update on resize
  //   let arrangementWidth = this.get('arrangementWidth');

  //   let ticks = ticksOnScreen * (arrangementWidth / viewWidth);
  //   return ticks;
  // }),

  // _getParentWidth() {
  //   let parentView = this.get('parentView');

  //   if (parentView.get('isInDom')) {
  //     return parentView.$().width();
  //   }
  // },
});
