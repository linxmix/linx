import DS from 'ember-data';

export default DS.Model.extend({
  start: function() {
    // TODO: base on fromTrack and toTrack overlap
  }.property('foo'),

  fromTrackClip: DS.belongsTo('track-clip', { async: true }),
  toTrackClip: DS.belongsTo('track-clip', { async: true }),

});
