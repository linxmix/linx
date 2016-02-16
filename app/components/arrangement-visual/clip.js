import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'ember-cli-d3/mixins/d3-support';
import { join } from 'ember-cli-d3/utils/d3';

import RequireAttributes from 'linx/lib/require-attributes';
import multiply from 'linx/lib/computed/multiply';

// TODO(REFACTOR): do we need this anymore? mixin?
export default Ember.Component.extend(
  GraphicSupport,
  RequireAttributes('clip', 'pxPerBeat'), {

  height: 0,
  width: Ember.computed.reads('clip.beatCount'),

  width: multiply('beatCount', 'pxPerBeat'),
  startBeat: null,
  // TODO(REFACTOR): make similar to cssStyle, transformStyle({ attrs })
  // TODO(REFACTOR): or use different transofmrs here https://www.dashingd3js.com/svg-group-element-and-d3js#svg-mini-language-div
  transform: Ember.computed('startBeat', 'pxPerBeat', function() {
    const translateX = this.get('startBeat') * this.get('pxPerBeat');
    return `translate(${translateX})`;
  }),

  call(selection) {
    selection.classed('ArrangementVisualClip', true)
      .attr('transform', this.get('transform'));

    this.backdrop(selection);
  },

  backdrop: join([0], 'rect.ArrangementVisualClip-backdrop', {
    update(selection) {
      selection
        .attr('height', this.get('height'))
        .attr('width', this.get('width'))
        .on('click', () => this.sendAction('onClick', this.get('clip')));
    }
  }),

  // TODO(REFACTOR): how to handle dragging? can we do with d3?
});


// // TODO(CLEANUP): create draggable mixin for normal DOM elements, as follows?
//   isDraggable: false,
//   draggable: Ember.computed.reads('isDraggable'),

//   getHoverBeat(e) {
//     if (!e) { return; }

//     let $this = this.$();
//     let offsetX = e.originalEvent.pageX - $this.offset().left;

//     return offsetX / this.get('pxPerBeat');
//   },

//   // WIP: trying to get rid of ghosting
//   // dragStart(e) {
//   //   e.originalEvent.dataTransfer.setDragImage('', 10, 10);
//   // },

//   drag(e) {
//     Ember.run.throttle(this, '_drag', e, 50, true);
//   },

//   _drag(e = {}) {
//     let originalEvent = e.originalEvent;
//     let { x, y } = originalEvent;

//     // ignore final drag event because it's at 0,0 (why?)
//     if (!(x === 0 && y === 0)) {
//      this.sendAction('onDrag', this.getHoverBeat(e));
//     }
//   }
