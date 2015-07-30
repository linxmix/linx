import DS from 'ember-data';
import withDefaultModel from 'linx/lib/computed/with-default-model';

export default DS.Model.extend({
  title: DS.attr('string'),

  forkedFrom: DS.belongsTo('transition-template', { async: true, inverse: 'forks'}),
  forks: DS.hasMany('transition-template', { async: true, inverse: 'forkedFrom'}),

  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    return this.get('store').createRecord('arrangement');
  }),

  transitions: DS.hasMany('transition', { async: true })
});
