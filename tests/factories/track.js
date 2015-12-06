import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('track', {
  sequences: {
    title: function(num) {
      return 'track' + num;
    },
    artist: function(num) {
      return 'artist' + num;
    }
  },

  default: {
    title: FactoryGuy.generate('title'),
    artist: FactoryGuy.generate('artist'),
    _audioMeta: {},
  },

  'giveitupforlove': {
    title: 'giveitupforlove',
    s3Url: 'songs/2aa83018ce0bb7ca44e9263ed5d25817.mp3'
  },
});
