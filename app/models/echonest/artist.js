// credits to https://github.com/robwebdev/ember-cli-echonest
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  biographies: DS.attr(),
  images: DS.attr(),
  terms: DS.attr(),
  similar: DS.hasMany('echonest/artist', {async: true}),
  genres: DS.attr(),
  bucket: [
    'biographies',
    'blogs',
    'discovery',
    'doc_counts',
    'familiarity',
    'genre',
    'hotttnesss',
    'images',
    'artist_location',
    'news',
    'reviews',
    'songs',
    'urls',
    'video',
    'years_active'
  ]
});
