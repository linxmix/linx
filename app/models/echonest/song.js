// credits to https://github.com/robwebdev/ember-cli-echonest
import DS from 'ember-data';

export default DS.Model.extend({
  artist: DS.belongsTo('echonest/artist', { async: true }),
  title: DS.attr('string'),
  artist_name: DS.attr('string'),
  bucket: [
    'audio_summary',
    'artist_discovery',
    'artist_familiarity',
    'artist_hotttnesss',
    'artist_location',
    'song_currency',
    'song_discovery',
    'song_hotttnesss',
    'tracks'
  ]
});
