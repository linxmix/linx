import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  s3Url: DS.attr('string'),

  s3StreamUrl: function() {
    return "http://s3-us-west-2.amazonaws.com/linx-music/" + this.get('s3Url');
  }.property('s3Url')
});
