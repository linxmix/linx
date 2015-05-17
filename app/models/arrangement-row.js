import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  index: DS.attr('number'),

  arrangement: DS.belongsTo('arrangement'),
  clips: DS.hasMany('arrangement-clip'),

  addClip: function(clip) {
    this.addClips([clip]);
  },

  addClips: function(clips) {
    this.get('clips').pushObjects(clips);
  },
});
