import Ember from 'ember';

import d3 from 'd3';
import _ from 'npm:underscore';
import DataVisual from 'ember-cli-d3/components/data-visual';

import RequireAttributes from 'linx/lib/require-attributes';
import PreventMacBackScroll from 'linx/mixins/prevent-mac-back-scroll';
import cssStyle from 'linx/lib/computed/css-style';
import { clamp, isNumber } from 'linx/lib/utils';
import multiply from 'linx/lib/computed/multiply';

// ms to wait between zoom events
const ZOOM_THROTTLE_DELAY = 0;

export default DataVisual.extend(
  // PreventMacBackScroll,
  RequireAttributes('arrangement', 'pxPerBeat'), {

  // optional params
  isReady: true,
  zoom: Ember.computed(() => d3.behavior.zoom()),

  classNames: ['ArrangementVisual'],
  classNameBindings: ['isReady::ArrangementVisual--loading'],

  didZoom: _.throttle(function() {
    const { zoom, minX, maxX, minY, maxY } = this.getProperties('zoom', 'minX', 'maxX', 'minY', 'maxY');
    const translate = zoom.translate();

    let scale = zoom.scale();
    // translate[0] = clamp(-(maxX * scale), translate[0], 0);
    // translate[1] = clamp(minY, translate[1], maxY * scale);
    translate[1] = 0;
    // zoom.translate(translate);
    this.get('selection').attr('transform', `translate(${translate}) scale(${scale}, 1)`);

    const event = Ember.get(d3, 'event.sourceEvent');
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, ZOOM_THROTTLE_DELAY),

  // used for constraining zoom
  minX: 0,
  maxX: multiply('arrangement.beatCount', 'pxPerBeat'),
  minY: 0,
  maxY: Ember.computed.reads('height'),

  beatScale: Ember.computed('maxX', function () {
    let domainMax = this.get('maxX');

    return d3.scale.linear().domain([0, domainMax + 0]).range([0, domainMax]);
  }).readOnly(),

  barScale: Ember.computed('arrangement.barCount', 'minX', 'maxX', function () {
    let domainMax = this.get('arrangement.barCount');

    return d3.scale.linear().domain([0, domainMax + 0]).range([this.get('minX'), this.get('maxX')]);
  }).readOnly(),

  svg: Ember.computed.reads('stage.svg.select'),
  select: Ember.computed.reads('svg.ArrangementVisual-arrangement'),
  selection: Ember.computed.reads('select.selection'),

  // NOTE: have to use svg.selection explicitly to zoom correct piece
  setupZoom: Ember.observer('svg.selection', 'zoom', function() {
    const { 'svg.selection': selection, zoom } = this.getProperties('svg.selection', 'zoom');

    // TODO(CLEANUP): need to call 'off' on willDestroy. or just destroy zoom and svg?
    // not easy to undo zoom
    // http://stackoverflow.com/questions/22302919/unregister-zoom-listener-and-restore-scroll-ability-in-d3-js/22303160?noredirect=1#22303160
    if (selection && zoom) {
      zoom.on('zoom', this.didZoom.bind(this));
      selection.call(zoom); // delete this line to disable free zooming
      selection.call(zoom.event);
    }
  }).on('didInsertElement'),

  setupClickHandler: Ember.observer('selection', function() {
    const { selection } = this.getProperties('selection');
    const context = this;
    selection && selection.on('click', function() {

      // If the drag behavior prevents the default click,
      // also stop propagation so we don’t click-to-zoom.
      if (d3.event.defaultPrevented) { d3.event.stopPropagation(); }

      if (!d3.event.defaultPrevented) {
        const beat = d3.mouse(this)[0] / context.get('pxPerBeat');
        context.sendAction('seekToBeat', beat);
      }
    }, true);
  }).on('didInsertElement'),

  //
  // backdrop
  //
  // playheadSelection: Ember.computed('selection', function() {
  //   const selection = this.get('selection');
  //   return selection && selection.append('line').classed('ArrangementVisual-playhead', true);
  // }),
  // initPlayhead: Ember.observer('playheadSelection', function() {
  //   // trigger playhead element to ensure it's drawn
  //   this.updatePlayhead();
  // }).on('didInsertElement'),
});
