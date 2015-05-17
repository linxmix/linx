import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({

  rows: DS.hasMany('arrangement-row'),
  mix: DS.belongsTo('mix'),

  sortedRows: Ember.computed.sort('rows', function(rowX, rowY) {
    return Ember.compare(rowX.get('index'), rowY.get('index'));
  }),

  appendRow: function(row) {
    this.appendRows([row]);
  },

  appendRows: function(rows) {
    var index = this.get('rows.length');

    rows.forEach(function(row) {
      row.set('index', index++);
    });

    this.get('rows').pushObjects(rows);
  },
});
