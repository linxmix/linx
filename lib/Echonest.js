/* global Echonest: true */

Echonest = {

  identifyTrackMD5: function(md5, options) {
    console.log("attempt identifyMD5", md5);
    $.ajax({
      type: "GET",
      url: 'http://developer.echonest.com/api/v4/track/profile',
      data: {
        api_key: Config.apiKey_Echonest,
        md5: md5,
      },
      success: function(response) {
        options.onSuccess(Graviton.getProperty(response, 'response.track'));
      },
      error: function(xhr) {
        console.error(xhr);
        throw new Error('Failed to identifyMD5: ' + md5);
      },
    });
  },

  fetchTrackAnalysis: function(track, cb) {
    console.log("fetching analysis", track);
    // If already have analysis, short circuit
    if (track.getAnalysis()) {
      console.log("Track already has echonest analysis, skipping", track.get('title'));
      cb && cb();
    } else {

      // fetch profile before analyzing
      Echonest.fetchTrackProfile(track, function() {
        var loadingInterval = track.setLoadingInterval({
          type: 'analyze',
          time: 10000,
        });

        // attempt 5 times with 5 seconds between each.
        var count = 0;
        function attempt() {
          // console.log("fetching echonest analysis: ", "attempt: " + count, track);

          $.ajax({
            type: "GET",
            url: track.get('echonest.audio_summary.analysis_url'),
            success: function(response) {
              Meteor.clearInterval(loadingInterval);
              track.set('loading', false);
              track.setAnalysis(response);
              cb && cb();
            },
            error: function(xhr) {
              // retry on error
              if (count++ <= 5) {
                Meteor.setTimeout(attempt, 5000);
              } else {
                Meteor.clearInterval(loadingInterval);
                track.set('loading', false);
                console.error(new Error('Failed to get echonest analysis for track: ' + track.get('title')));
                console.error(xhr);
                cb && cb()
              }
            },
          });
        }

        attempt();
      });
    }
  },

  fetchTrackProfile: function(track, cb) {
    // first get echonestId of track
    Echonest.fetchTrackId(track, function(echonestId) {
      // console.log("fetching echonest profile", track.get('title'));
      var loadingInterval = track.setLoadingInterval({
        type: 'profile',
        time: 1000
      });

      // send profile request
      $.ajax({
        type: "GET",
        url: 'http://developer.echonest.com/api/v4/track/profile',
        cache: false, // do not cache so we get a fresh analysis_url
        data: {
          api_key: Config.apiKey_Echonest,
          bucket: 'audio_summary',
          format: 'json',
          id: echonestId,
        },
        success: function(response) {
          Meteor.clearInterval(loadingInterval);
          track.set('loading', false);
          track.setEchonest(Graviton.getProperty(response, 'response.track'));
          cb && cb();
        },
        error: function() {
          Meteor.clearInterval(loadingInterval);
          track.set('loading', false);
          console.error(new Error('Failed to get echonest profile for track: ' + track.get('title')));
          cb && cb();
        }
      });      
    });
  },

  fetchTrackId: function(track, cb) {
    // short-circuit if we already have the id
    if (track.get('echonest.id')) {
      // console.log("track already has echonest id, skipping", track);
      cb && cb(track.get('echonest.id'));
    } else {
      // console.log("getting echonestId of track", track);
      var streamUrl = track.getStreamUrl(track.getBackendSource());
      var loadingInterval = track.setLoadingInterval({
        type: 'profile',
        // time: wave.getCrossloadTime(track.getSource())
        time: 10000, // TODO: get crossload time
      });

      // start upload
      $.ajax({
        type: "POST",
        url: 'http://developer.echonest.com/api/v4/track/upload',
        data: {
          api_key: Config.apiKey_Echonest,
          url: streamUrl
        },
        success: function(response) {
          Meteor.clearInterval(loadingInterval);
          track.set('loading', false);
          cb && cb(Graviton.getProperty(response, 'response.track.id'));
        },
        error: function(xhr) {
          Meteor.clearInterval(loadingInterval);
          track.set('loading', false);
          console.error(new Error('Failed upload track to echonest: ' + track.get('title')));
          console.error(xhr);
          cb && cb();
        },
      });
    }
  },
};
