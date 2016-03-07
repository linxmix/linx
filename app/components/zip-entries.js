import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'ember-cli-d3/mixins/d3-support';
import { join } from 'ember-cli-d3/utils/d3';
import SelectionProxy from 'ember-cli-d3/system/selection-proxy';

export default Ember.Component.extend(
  GraphicSupport, {

  // required params
  requiredProperties: ['items'],

  items: null,
  select: null,
  tags: null,

  entries: Ember.computed('items.[]', 'tags.[]', function () {
    if (this.get('tags.length') && this.get('items.length')) {
      return d3.zip(this.get('items'), this.get('tags')).map(([ item, tag ]) => {
        return { item, tag };
      });
    } else {
      return [];
    }
  }),

  call: join('items', '.item', {
    // 'selection' is a d3 selection, not an ember-cli-d3 selection
    update(selection) {
      // for each element, create a new ember-cli-d3 selection
      this.set('tags', selection[0].map((selection) => {
        return SelectionProxy.create({ element: selection }).get('select');
      }));
    }
  }),
});
