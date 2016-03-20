import Ember from 'ember';

import d3 from 'd3';

import GraphicSupport from 'linx/mixins/d3/graphic-support';

export default Ember.Mixin.create(
  GraphicSupport('isDraggable'), {

  // required params
  isDraggable: false,
  pxPerBeat: 0,

  // optional params
  dragOriginX: null,
  dragOriginY: null,
  drag: Ember.computed(() => d3.behavior.drag()),
  onDrag(d3Context, d, beats) {},
  onDragStart(d3Context) {},
  onDragEnd(d3Context, d, beats) {},

  _dragX: 0,
  _dragY: 0,
  _initDragHandlers: Ember.on('init', function() {
    const context = this;
    const drag = this.get('drag');

    drag.origin(function(d) {
      console.log('dragOriginX', context.get('dragOriginX'))
      return {
        x: context.get('dragOriginX'),
        y: context.get('dragOriginY')
      };
    });

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
