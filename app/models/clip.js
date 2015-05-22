import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({

  start: DS.attr('number'),
  end: DS.attr('number'),

  item: DS.belongsTo('arrangement-item'),

  length: function() {
    return this.get('end') - this.get('start');
  }.property('start', 'end'),
});
