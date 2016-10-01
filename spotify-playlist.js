const request = require('request');
const _ = require('underscore');
const util = require('util');

const client_id = '64f30243962b40668f6bd6ffce945e55';
const client_secret = process.env.SPOTIFY_SECRET;

const CAMELOT_KEYS = {
  'Abm':  '1a',
  'B':    '1b',
  'Ebm':  '2a',
  'Gb':   '2b',
  'Bbm':  '3a',
  'Db':   '3b',
  'Fm':   '4a',
  'Ab':   '4b',
  'Cm':   '5a',
  'Eb':   '5b',
  'Gm':   '6a',
  'Bb':   '6b',
  'Dm':   '7a',
  'F':    '7b',
  'Am':   '8a',
  'C':    '8b',
  'Em':   '9a',
  'G':    '9b',
  'Bm':   '10a',
  'D':    '10b',
  'Gbm':  '11a',
  'A':    '11b',
  'Dbm':  '12a',
  'E':    '12b',
};

const ECHONEST_KEYS = {
  '0':  'C',
  '1':  'Db',
  '2':  'D',
  '3':  'Eb',
  '4':  'E',
  '5':  'F',
  '6':  'Gb',
  '7':  'G',
  '8':  'Ab',
  '9':  'A',
  '10': 'Bb',
  '11': 'B',
};

const ECHONEST_MODES = {
  '0': 'minor',
  '1': 'major'
};

function featureToCamelotKey(feature) {
  const modeString = feature.mode === 1 ? '' : 'm';

  const key = feature.key
  const keyString = ECHONEST_KEYS[key] ? ECHONEST_KEYS[key] : '';

  // something like 'C' or 'Cbm'
  const keyName = keyString.concat(modeString);

  return CAMELOT_KEYS[keyName] + ' ' + keyName;
}

const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
  console.log('Auth Post Complete', response.statusCode);

  // use the access token to access the Spotify Web API
  const token = body.access_token;
  const playlistRequestOptions = {
    // caio list
    // url: 'https://api.spotify.com/v1/users/12101500688/playlists/1kj7ZNejTZvjyFHYrm2ACC/tracks',
    // jas list
    // url: 'https://api.spotify.com/v1/users/12145773870/playlists/1spxWIO4imwkeiKk54ovH1/tracks',
    // lindsay list
    url: 'https://api.spotify.com/v1/users/cadeparade/playlists/7LGv5LTmeidMuGauDMrSRN/tracks',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };

  request.get(playlistRequestOptions, function(error, response, body) {
    console.log('Playlist Fetch Complete', response.statusCode);

    const tracks = body.items.map(function(item) { return item.track });

    const audioFeatureUrl = 'https://api.spotify.com/v1/audio-features/?ids=' +
      tracks.map(function(track, i) { return track.id; });

    const featureRequestOptions = {
      url: audioFeatureUrl,
      headers: playlistRequestOptions.headers,
      json: true,
    };

    request.get(featureRequestOptions, function(error, response, body) {
      console.log('Audio Features Fetch Complete', response.statusCode);

      // use the audio features to print out relevant info
      const audioFeatures = body.audio_features;

      const readableTrackFeatures = _.sortBy(audioFeatures
        .map(function(feature) {
          const track = _.find(tracks, function(track) { return track.id === feature.id });
          return {
            name: track.name,
            artist: track.artists[0].name,
            tempo: feature.tempo,
            key: featureToCamelotKey(feature),
          };
        })
        .filter((track) => {
          // return track.tempo > 122 && track.tempo < 130
          return true
        })
      , 'key');

      console.log('TOTAL TRACKS: ', readableTrackFeatures.length);
      console.log(util.inspect(readableTrackFeatures, { depth: null, colors: true }));
    });
  });
});
