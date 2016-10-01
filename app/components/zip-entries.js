import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';
import SelectionProxy from 'ember-cli-d3/system/selection-proxy';

export default Ember.Component.extend(
  GraphicSupport('items.[]', 'cssExpr'), {

  // required params
  requiredProperties: ['items'],

  items: null,
  select: null,
  tags: null,

  // optional params
  cssExpr: '.item', // NOTE: nested zip-entries cannot use the same cssExpr

  entries: Ember.computed('items.[]', 'tags.[]', function () {
    if (this.get('tags.length') && this.get('items.length')) {
      return d3.zip(this.get('items').toArray(), this.get('tags')).map(([ item, tag ]) => {
        return { item, tag };
      });
    } else {
      return [];
    }
  }),

  call(selection) {
    this._super.apply(this, arguments);
    this.createTags(selection);
  },

  createTags(selection) {
    return this.get('_joinFunction').call(this, selection);
  },

  _joinFunction: Ember.computed('cssExpr', function() {
    return join('items', this.get('cssExpr'), {
      // 'selection' is a d3 selection, not an ember-cli-d3 selection
      update(selection) {
        // for each element, create a new ember-cli-d3 selection
        this.set('tags', selection[0].map((selection) => {
          return SelectionProxy.create({ element: selection }).get('select');
        }));
      },
    });
  }),
});
