import Ember from 'ember';

export default function(numRetries, waitInterval, promise) {
  return Ember.RSVP.Promise(resolve, reject)
    var count = 0;
    function attempt() {
      // console.log("fetching echonest analysis: ", "attempt: " + count, track);

      $.ajax({
        success: function(response) {
          Meteor.clearInterval(loadingInterval);
          track.set('loading', false);
          track.setAnalysis(response);
          cb && cb();
        },
        error: function(xhr) {
          // retry on error
          if (count++ <= 5) {
            Meteor.setTimeout(attempt, 3000);
          } else {
            Meteor.clearInterval(loadingInterval);
            track.set('loading', false);
            console.error(new Error('Failed to get echonest analysis for track: ' + track.get('title')));
            console.error(xhr);
            track.set('echonest', {});
            Echonest.fetchTrackAnalysis(track, cb);
          }
        },
      });
    }

    attempt();

}
