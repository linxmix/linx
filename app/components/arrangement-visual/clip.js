import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';
import subtract from 'linx/lib/computed/subtract';
import { propertyOrDefault } from 'linx/lib/computed/ternary';
import GraphicSupport from 'ember-cli-d3/mixins/d3-support';

// TODO(REFACTOR): do we need this anymore? mixin?
export default Ember.Component.extend(
  GraphicSupport,
  RequireAttributes('clip'), {

  classNames: ['ArrangementVisualClip'],
  // attributeBindings: ['componentStyle:style', 'draggable'],
  // classNameBindings: ['isDraggable'],

  componentStyle: cssStyle({
    'left': 'startPx',
    'width': 'widthPx',
  }),

  // TODO(REFACTOR): make similar to cssStyle, transformStyle({ attrs })
  // TODO(REFACTOR): or use different transofmrs here https://www.dashingd3js.com/svg-group-element-and-d3js#svg-mini-language-div
  transform: Ember.computed('startBeat', function() {
    const { startPx } = this.get('startPx');
    console.log('transform', this.get('startPx'), this.get('pxPerBeat'));
    return `translate(${this.beatToPx(this.get('clip.startBeat'))})`;
  }),

  updateTransform: Ember.observer('select.selection', 'transform', function() {
    console.log('updateTransform');
    const selection = this.get('select.selection');
    selection && selection.attr('transform', this.get('transform'));
  }),

  call(selection) {
    selection.classed('ArrangementVisualClip', true)
    this.updateTransform();
  },


  // TODO(CLEANUP): refactor into draggable mixin?
  isDraggable: false,
  draggable: Ember.computed.reads('isDraggable'),

  getHoverBeat(e) {
    if (!e) { return; }

    let $this = this.$();
    let offsetX = e.originalEvent.pageX - $this.offset().left;

    return offsetX / this.get('pxPerBeat');
  },

  // WIP: trying to get rid of ghosting
  // dragStart(e) {
  //   e.originalEvent.dataTransfer.setDragImage('', 10, 10);
  // },

  drag(e) {
    Ember.run.throttle(this, '_drag', e, 50, true);
  },

  _drag(e = {}) {
    let originalEvent = e.originalEvent;
    let { x, y } = originalEvent;

    // ignore final drag event because it's at 0,0 (why?)
    if (!(x === 0 && y === 0)) {
     this.sendAction('onDrag', this.getHoverBeat(e));
    }
  },

  startPx: function() {
    return this.beatToPx(this.get('clip.startBeat')) + 'px';
  }.property('clip.startBeat', 'pxPerBeat'),

  endPx: function() {
    return this.beatToPx(this.get('clip.endBeat')) + 'px';
  }.property('clip.endBeat', 'pxPerBeat'),

  widthPx: function() {
    return this.beatToPx(this.get('clip.beatCount')) + 'px';
  }.property('clip.beatCount', 'pxPerBeat'),

  beatToPx: function(beat) {
    return beat * this.get('pxPerBeat'); // beat * (px / beat) = px
  },
});
