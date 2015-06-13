import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';
import { flatten } from 'linx/utils';

export default DS.Model.extend(
  AbstractListMixin('arrangement-row'), {

  totalBeats: DS.attr('number'), // total number of beats in this arrangement

  // params
  rows: Ember.computed.alias('content'),
  items: function() {
    return flatten(this.get('rows').mapBy('items'));
  }.property('rows.@each.items'),

  createRow: function(params) {
    return this.createItem(params);
  },
});
