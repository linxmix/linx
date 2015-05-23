import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  url: DS.attr('string'),
  length: DS.attr('number'),

  audioClip: DS.hasMany('audio-clip', { async: true }),
  analysis: DS.belongsTo('analysis', { async: true }),

  s3StreamUrl: function() {
    return "http://s3-us-west-2.amazonaws.com/linx-music/" + this.get('s3Url');
  }.property('s3Url'),

  streamUrl: Ember.computed.any('s3StreamUrl', 'url'),
});
