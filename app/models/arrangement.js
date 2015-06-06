import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';

export default DS.Model.extend(
  AbstractListMixin('arrangement-row'), {

  totalBeats: DS.attr('number'), // total number of beats in this arrangement

  createRow: function(params) {
    return this.createItem(params);
  },
});
