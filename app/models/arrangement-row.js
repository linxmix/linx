import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  clips: DS.hasMany('clip'),
});
