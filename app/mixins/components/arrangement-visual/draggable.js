import Ember from 'ember';

import d3 from 'd3';

export default Ember.Mixin.create({

  // optional params
  isDraggable: false,

  drag: Ember.computed(function() {
    return d3.behavior.drag();
  }),

  onDrag(beats) {},
  onDragStart() {},
  onDragEnd(beats) {},

  _dragBeatCount: 0,
  _initDragHandlers: Ember.on('init', function() {
    if (!this.get('isDraggable')) return;

    const drag = this.get('drag');
    const context = this;

    drag.on('drag', function() {
      let dragBeatCount = context.get('_dragBeatCount');
      dragBeatCount += d3.event.dx / context.get('pxPerBeat');
      context.set('_dragBeatCount', dragBeatCount);

      context.onDrag(dragBeatCount);
    });

    drag.on('dragstart', function() {
      d3.event.sourceEvent.stopPropagation(); // silence other listeners

      context.onDragStart();
    });

    drag.on('dragend', function() {
      const dragBeatCount = context.get('_dragBeatCount');

      d3.event.sourceEvent.stopPropagation(); // silence other listeners
      context.set('_dragBeatCount', 0);

      context.onDragEnd(dragBeatCount);
    });
  }),
})
