import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';

import DraggableMixin from 'linx/mixins/components/arrangement-visual/draggable';

export default Ember.Component.extend(
  DraggableMixin,
  GraphicSupport('height', 'markerAttrs'), {

  // required params
  height: null,
  markerAttrs: null,

  call(selection) {
    this._super.apply(this, arguments);
    this.drawMarker(selection);
  },

  drawMarker: join([0], 'line.ArrangementVisualClipMarker', {
    update(selection) {

      selection
        .attr('y1', 0)
        .attr('y2', this.get('height'));

      const attrs = this.get('markerAttrs');

      if (attrs) {
        selection.attr(attrs);
      }
    }
  }),
});

