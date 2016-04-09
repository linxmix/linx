import Ember from 'ember';

import d3 from 'd3';

import GraphicSupport from 'linx/mixins/d3/graphic-support';

export default Ember.Mixin.create(
  GraphicSupport('isDraggable'), {

  // required params
  isDraggable: false,
  dragTransformsParent: false, // see drag.origin note
  pxPerBeat: 0,

  // optional params
  drag: Ember.computed(() => d3.behavior.drag()),

  actions: {
    onDrag(d3Context, d, beats) { return true; },
    onDragStart(d3Context) { return true; },
    onDragEnd(d3Context, d, beats) { return true; },
  },

  _dragX: 0,
  _dragY: 0,
  _initDragHandlers: Ember.on('init', function() {
    const context = this;
    const drag = this.get('drag');

    // we do not use `d3.event.x` or `d3.event.y` as absolute positions
    // therefore, set 'x' and 'y' to 0 so we can use them for `dx` and `dy`
    // see http://stackoverflow.com/questions/13078535/stuttering-drag-when-using-d3-behavior-drag-and-transform
    if (context.get('dragTransformsParent')) {
      drag.origin(function(d) {
        return {
          x: 0,
          y: 0,
        };
      });
    }

    drag.on('drag', function(d) {
      if (!context.get('isDraggable')) return;

      const pxPerBeat = context.get('pxPerBeat');
      let { _dragX, _dragY } = context.getProperties('_dragX', '_dragY');

      let dx, dy
      if (context.get('dragTransformsParent')) {
        dx = d3.event.x;
        dy = d3.event.y;
      } else {
        dx = d3.event.dx;
        dy = d3.event.dy;
      }

      _dragX += dx / pxPerBeat;
      _dragY += dy;
      context.setProperties({ _dragX, _dragY });

      context.send('onDrag', this, d, _dragX, _dragY);
    });

    drag.on('dragstart', function(d) {
      if (!context.get('isDraggable')) return;

      d3.event.sourceEvent.stopPropagation(); // silence other listeners
      context.send('onDragStart', this, d);
    });

    drag.on('dragend', function(d) {
      if (!context.get('isDraggable')) return;

      const { _dragX, _dragY } = context.getProperties('_dragX', '_dragY');

      d3.event.sourceEvent.stopPropagation(); // silence other listeners
      context.setProperties({
        _dragX: 0,
        _dragY: 0
      });

      context.send('onDragEnd', this, d, _dragX, _dragY);
    });
  }),
})
