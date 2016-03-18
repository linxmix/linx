import DS from 'ember-data';

export default DS.Model.extend({
  beat: DS.attr('number'),
  value: DS.attr('number'),
  automationClip: DS.belongsTo('arrangement/automation-clip'),
});
