import Ember from 'ember';

import d3 from 'd3';

export default Ember.Mixin.create({

  // required params
  isDraggable: false,
  pxPerBeat: 0,

  drag: Ember.computed(function() {
    return d3.behavior.drag();
  }),

  onDrag(d3Context, d, beats) {},
  onDragStart(d3Context) {},
  onDragEnd(d3Context, d, beats) {},

  _dragX: 0,
  _dragY: 0,
  _initDragHandlers: Ember.on('init', function() {
    const context = this;
    const drag = this.get('drag');

    drag.on('drag', function(d) {
      if (!context.get('isDraggable')) return;

      const pxPerBeat = context.get('pxPerBeat');
      let { _dragX, _dragY } = context.getProperties('_dragX', '_dragY');

      _dragX += d3.event.dx / pxPerBeat;
      _dragY += d3.event.dy;
      context.setProperties({ _dragX, _dragY });

      context.onDrag(this, d, _dragX, _dragY);
    });

    drag.on('dragstart', function(d) {
      if (!context.get('isDraggable')) return;

      d3.event.sourceEvent.stopPropagation(); // silence other listeners
      context.onDragStart(this, d);
    });

    drag.on('dragend', function(d) {
      if (!context.get('isDraggable')) return;

      const { _dragX, _dragY } = context.getProperties('_dragX', '_dragY');

      d3.event.sourceEvent.stopPropagation(); // silence other listeners
      context.setProperties({
        _dragX: 0,
        _dragY: 0
      });

      context.onDragEnd(this, d, _dragX, _dragY);
    });
  }),
})
