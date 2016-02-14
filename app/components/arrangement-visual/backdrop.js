import Ember from 'ember';

import GraphicSupport from 'ember-cli-d3/mixins/d3-support';
import { join } from 'ember-cli-d3/utils/d3';

export default Ember.Component.extend(GraphicSupport, {
  height: 0,
  width: 0,

  call: join([0], 'rect.ArrangementVisualBackdrop', {
    update(selection) {
      selection
        .attr('height', this.get('height'))
        .attr('width', this.get('width'));
    }
  }),
});
