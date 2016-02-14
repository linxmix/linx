import Ember from 'ember';

import d3 from 'd3';
import DataVisual from 'ember-cli-d3/components/data-visual';

import RequireAttributes from 'linx/lib/require-attributes';
import PreventMacBackScroll from 'linx/mixins/prevent-mac-back-scroll';
import cssStyle from 'linx/lib/computed/css-style';
import { clamp, isNumber } from 'linx/lib/utils';

// used for cancelAnimationFrame
let playheadAnimationId;

export default DataVisual.extend(
  // PreventMacBackScroll,
  RequireAttributes('arrangement'), {

  // optional params
  isReady: false,
  zoom: Ember.computed(() => d3.behavior.zoom()),

  classNames: ['ArrangementVisual'],
  classNameBindings: ['isReady::ArrangementVisual--loading'],

  didZoom() {
    const { zoom, minX, maxX, minY, maxY } = this.getProperties('zoom', 'minX', 'maxX', 'minY', 'maxY');
    const translate = zoom.translate();

    let scale = zoom.scale();
    // translate[0] = clamp(-(maxX * scale), translate[0], 0);
    // translate[1] = clamp(minY, translate[1], maxY * scale);
    // translate[1] = 0;
    // zoom.translate(translate);
    this.get('selection').attr('transform', `translate(${translate}) scale(${scale})`);

    const event = Ember.get(d3, 'event.sourceEvent');
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  },

  updatePlayhead() {
    const currentBeat = this.get('metronome').getCurrentBeat();
    const playheadSelection = this.get('playheadSelection');

    playheadSelection && playheadSelection
      .attr('transform', `translate(${currentBeat})`)
      .attr('y1', this.get('minY'))
      .attr('y2', this.get('maxY'))
  },

  // used for constraining zoom
  minX: 0,
  maxX: Ember.computed.reads('arrangement.beatCount'),
  minY: 0,
  maxY: 128, // TODO(REFACTOR): how to handle y scale for arrangement?

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
      zoom(selection);
    }
  }).on('didInsertElement'),

  setupClickHandler: Ember.observer('selection', function() {
    const { selection } = this.getProperties('selection');
    const context = this;
    selection && selection.on('click', function() {
      if (!d3.event.defaultPrevented) {
        context.sendAction('seekToBeat', d3.mouse(this)[0]);
      }
    });
  }).on('didInsertElement'),

  // playhead logic
  playheadSelection: Ember.computed('selection', function() {
    const selection = this.get('selection');
    return selection && selection.append('line').classed('ArrangementVisual-playhead', true);
  }),
  metronome: Ember.computed.reads('arrangement.metronome'),

  initPlayhead: Ember.observer('playheadSelection', function() {
    // trigger playhead element to ensure it's drawn
    this.updatePlayhead();
  }).on('didInsertElement'),

  startPlayheadAnimation: Ember.observer('metronome.isPlaying', 'metronome.seekBeat', function() {
    const context = this;

    // uses requestAnimationFrame to animate the arrangement-visual's playhead
    function animatePlayhead() {
      const metronome = context.get('metronome');

      context.updatePlayhead();

      if (metronome.get('isPlaying')) {
        playheadAnimationId = window.requestAnimationFrame(animatePlayhead);
      } else {
        playheadAnimationId = undefined;
      }
    }

    this.stopPlayheadAnimation();
    animatePlayhead();
  }).on('didInsertElement'),

  stopPlayheadAnimation: Ember.on('willDestroyElement', function() {
    window.cancelAnimationFrame(playheadAnimationId);
  }),

  // TODO(SVG) implement this?
  // on click, seekToBeat
  // click(e) {
  //   let $el = this.$();
  //   let offsetX = e.pageX - ($el.offset().left);
  //   let scrollLeft = ($el.scrollLeft());
  //   let x = offsetX + scrollLeft;
  //   let beat = x / this.get('pxPerBeat');

  //   this.sendAction('seekToBeat', beat);
  // },
});
