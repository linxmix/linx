import Ember from 'ember';

import InboundActions from 'ember-component-inbound-actions/inbound-actions';
import _ from 'npm:underscore';
import d3 from 'd3';
import DataVisual from 'ember-cli-d3/components/data-visual';

import { clamp, isValidNumber } from 'linx/lib/utils';
import multiply from 'linx/lib/computed/multiply';

// ms to wait between zoom events
const ZOOM_THROTTLE_DELAY = 0;

export default DataVisual.extend(
  InboundActions, {

  // required params
  arrangement: null,
  pxPerBeat: 0,

  // optional params
  showBarGrid: true,
  isReady: true,
  zoom: Ember.computed(() => d3.behavior.zoom()),

  classNames: ['ArrangementVisual'],
  classNameBindings: ['isReady::ArrangementVisual--loading'],

  actions: {
    zoomToClip(clip, doAnimate) {
      const centerBeat = clip.get('centerBeat');
      const pxPerBeat = this.get('pxPerBeat');
      const clipWidthPx = clip.get('beatCount') * pxPerBeat;
      const viewWidthPx = this.get('width');
      const scale = viewWidthPx / clipWidthPx;
      this.send('zoomToBeat', centerBeat, scale, doAnimate);
    },

    zoomToBeat(beat, scale, doAnimate = true) {
      const zoom = this.get('zoom');
      const prevScale = zoom.scale();
      scale = isValidNumber(scale) ? scale : prevScale;
      let [ translateX, translateY ] = zoom.translate();
      const pxPerBeat = this.get('pxPerBeat');
      const svgSelection = this.get('selection');

      Ember.assert('Must have svgSelection to zoom', !!svgSelection);

      // calculate desired center
      const viewWidthPx = this.get('width');
      translateX = (viewWidthPx / 2.0) - (beat * pxPerBeat * scale);

      Ember.Logger.log('zoomToBeat', scale, translateX, translateY);

      // possibly animate zoom on svg selection
      if (doAnimate) {
        svgSelection
          .call(zoom.translate(zoom.translate()).event)
          .call(zoom.scale(prevScale).event)
          .transition()
          .duration(500) // TODO(SVG) make duration base off trnslate difference
          .call(zoom.scale(scale).event)
          .call(zoom.translate([ translateX, translateY ]).event);
      } else {
        svgSelection
          .call(zoom.scale(scale).event)
          .call(zoom.translate([ translateX, translateY ]).event);
      }
    }
  },

  svg: Ember.computed.reads('stage.svg.select'),
  select: Ember.computed.reads('svg.ArrangementVisual-arrangement'),
  selection: Ember.computed.reads('select.selection'),

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

  _didZoom: _.throttle(function() {
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

  // NOTE: have to use svg.selection explicitly to zoom correct piece
  _setupZoom: Ember.observer('svg.selection', 'zoom', function() {
    const { 'svg.selection': selection, zoom } = this.getProperties('svg.selection', 'zoom');

    // TODO(CLEANUP): need to call 'off' on willDestroy. or just destroy zoom and svg?
    // not easy to undo zoom
    // http://stackoverflow.com/questions/22302919/unregister-zoom-listener-and-restore-scroll-ability-in-d3-js/22303160?noredirect=1#22303160
    if (selection && zoom) {
      zoom.on('zoom', this._didZoom.bind(this));
      selection.call(zoom); // delete this line to disable free zooming
      selection.call(zoom.event);
    }
  }).on('didInsertElement'),

  _setupClickHandler: Ember.observer('selection', function() {
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
});
