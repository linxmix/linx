import Ember from 'ember';

import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';

export default Ember.Component.extend(
  GraphicSupport('height', 'width'), {

  height: 0,
  width: 0,

  call(selection) {
    this._super.apply(this, arguments);
    this.drawBackdrop(selection);
  },

  drawBackdrop: join([0], 'rect.ArrangementVisualBackdrop', {
    update(selection) {
      selection
        .attr('height', this.get('height'))
        .attr('width', this.get('width'));
    }
  }),
});
