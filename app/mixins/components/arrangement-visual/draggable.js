import Ember from 'ember';

import d3 from 'd3';

export default Ember.Mixin.create({

  // optional params
  isDraggable: false,

  drag: Ember.computed(function() {
    return d3.behavior.drag();
  }),

  onDrag(d3Context, d, beats) {},
  onDragStart(d3Context) {},
  onDragEnd(d3Context, d, beats) {},

  _dragBeatCount: 0,
  _initDragHandlers: Ember.on('init', function() {
    if (!this.get('isDraggable')) return;

    const context = this;
    const drag = this.get('drag');

    drag.on('drag', function(d) {
      let dragBeatCount = context.get('_dragBeatCount');
      dragBeatCount += d3.event.dx / context.get('pxPerBeat');
      context.set('_dragBeatCount', dragBeatCount);

      context.onDrag(this, d, dragBeatCount);
    });

    drag.on('dragstart', function(d) {
      d3.event.sourceEvent.stopPropagation(); // silence other listeners

      context.onDragStart(this, d);
    });

    drag.on('dragend', function(d) {
      const dragBeatCount = context.get('_dragBeatCount');

      d3.event.sourceEvent.stopPropagation(); // silence other listeners
      context.set('_dragBeatCount', 0);

      context.onDragEnd(this, d, dragBeatCount);
    });
  }),
})
