import Ember from 'ember';
import DS from 'ember-data';

// Base clip model
export default DS.Model.extend({

  // TODO: define api
  // length [ in beats? ]
  // playClip [ at given beat [ or time, 0-1? ] ]
  // pauseClip
  // tempo [ current tempo? ]
  // baseTempo

  arrangementItem: DS.hasMany('arrangement-item', { async: true }),

  // length: function() {
  //   return this.get('end') - this.get('start');
  // }.property('start', 'end'),
});
