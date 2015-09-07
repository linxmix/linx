import Ember from 'ember';

import {
  TRANSITION_IN_MARKER_TYPE,
  TRANSITION_OUT_MARKER_TYPE,
} from 'linx/models/marker';

const SONGS_PATH = '/assets/migrations/linx-meteor-songs.json';
const TRANSITIONS_PATH = '/assets/migrations/linx-meteor-transitions.json';

export default function(store) {

  Ember.RSVP.all([
    Ember.$.getJSON(SONGS_PATH),
    Ember.$.getJSON(TRANSITIONS_PATH),
  ]).then((results) => {
    let songs = results[0];
    let transitions = results[1];

    // populate tracks
    songs.forEach((song) => {
      console.log("song", song.title);

      let track = store.createRecord('track', {
        id: song._id,
        title: song.title || song.name,
        artist: song.artist,
        s3Url: 'songs/' + song._id + '.' + song.fileType,
        md5: song.md5,
      });

      track.save();
    });

    // populate transitions
    transitions.forEach((transition) => {
      console.log("transition", transition.dj);

      let fromTrack = store.find('track', transition.startSong);
      let toTrack = store.find('track', transition.endSong);

      // turn legacy transition file into track in transition's arrangement
      let arrangement = store.createRecord('arrangement');

      let transitionTrack = store.createRecord('track', {
        id: transition._id + '_transition_track',
        s3Url: 'transitions/' + transition._id + '.' + transition.fileType,
      });

      let transitionTrackClip = store.createRecord('track-clip', {
        model: transitionTrack,
        // TODO: convert to beats
        _audioStartBeat: transition.startTime,
        _audioEndBeat: transition.endTime,
      });

      arrangement.get('trackClips').addObject(transitionTrackClip);

      // create transition
      let transitionModel = store.createRecord('track', {
        id: transition._id,
        title: transition.dj,
        fromTrack,
        toTrack,
        // TODO: convert to beats
        numBeats: transition.endTime - transition.startTime
      });

      transitionTrack.save().then(() => {
        transitionTrackClip.save().then(() => {
          arrangement.save().then(() => {
            transitionModel.save().then(() => {
              transitionModel.setFromTrackEnd(transition.startSongEnd);
              transitionModel.setToTrackStart(transition.endSongStart);
            });
          });
        });
      });
    });
  });

}

// {
//     "_id": "Lg9JjwoT4mE9FPweY",
//     "dj": "Littlefinger",
//     "duration": 45.6875,
//     // "endSong": "MSTbGcajGri2Jyima",
//     "endSongStart": 30.01593807571035,
//     "endSongVolume": 0.9,
//     // "endTime": 41.054031197807106,
//     "fileType": "mp3",
//     "md5": "010555fa1e6fa2d756c86e824ce311bb",
//     "playCount": 2,
//     // "startSong": "YhG5iWctmmpeqQaDM",
//     "startSongEnd": 499.01526467616975,
//     "startSongVolume": 0.9,
//     // "startTime": 11.16233962002016,
//     "transitionType": "active",
//     "type": "transition",
//     "volume": 0.85
//   },
