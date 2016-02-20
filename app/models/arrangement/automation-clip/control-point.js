import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  automationClip: DS.belongsTo('arrangement/automation-clip'),
  startBeat: null, // relative to clip
  value: null, //
  // index: points.indexOf(this)
  // prevPoint: points.indexOf(index - 1)
  // nextPoint: points.indexOf()
});
