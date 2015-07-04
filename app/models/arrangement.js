import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';
import { flatten } from 'linx/lib/utils';

export default DS.Model.extend(
  AbstractListMixin('arrangement-row'), {

  totalBeats: DS.attr('number'), // total number of beats in this arrangement

  // params
  rows: Ember.computed.alias('content'),
  clips: function() {
    return flatten(this.get('rows').mapBy('clips'));
  }.property('rows.@each.clips'),

  createRow: function(params) {
    return this.createItem(params);
  },

  save: function() {
    console.log('save arrangement');
    return this._super.apply(this, arguments);
  }
});
