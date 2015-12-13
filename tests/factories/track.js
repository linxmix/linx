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
    _echonestTrack: {},
  },

  traits: {
    'withoutAudioMeta': {
      _audioMeta: null,
      _echonestTrack: null,
    },

    'withSmallS3Url': {
      title: 'royals:s3',
      s3Url: 'songs/08042d60-c4d7-4014-bce1-f05e93340a1f.mp3',
    },

    'withLocalFile': {
      title: 'royals:file',
      // TODO: make this random generate from a bunch
      fileUrl: '/assets/music/royals.mp3',
    },
  },

  'giveitupforlove': {
    title: 'giveitupforlove',
    s3Url: 'songs/2aa83018ce0bb7ca44e9263ed5d25817.mp3',
  },
});
