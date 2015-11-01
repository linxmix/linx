import Ember from 'ember';
import ENV from 'linx/config/environment';

import _ from 'npm:underscore';

import { executePromisesInSeries } from 'linx/lib/utils';

export default Ember.Route.extend({
  actions: {
    createMix() {
      let store = this.get('store');
      let mix = store.createRecord('mix', {
        title: 'Mix ' + Ember.uuid(),
      });

      // create the mix with a transition
      let tracks = this.get('controller.tracks');
      let [fromTrack, toTrack] = _.sample(tracks.toArray(), 2);

      console.log('tracks', tracks.toArray());
      console.log('fromTrack', fromTrack);
      console.log('toTrack', toTrack);

      mix.generateTransitionAt(0, {
        fromTrack,
        toTrack,
      }).then(() => {
        this.transitionTo('mix', mix);
      });
    },

    createCategoryMix() {
      var store = this.get('store');
      var mix = store.createRecord('mix', {
        title: 'Mix ' + Ember.uuid(),
      });

      $.get('/https://api-v2.soundcloud.com/explore/Popular+Music?tag=out-of-experiment&limit=10&offset=0&linked_partitioning=1&client_id=02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea&app_version=56ba14a').then((response) => {
        console.log('RESPONSE', response);

        let soundcloudTracks = store.push({
          data: response.tracks.map((track) => {

            // add client_id to stream_url
            if (track.stream_url) {
              track.stream_url += `?client_id=${ENV.SC_KEY}`;
              track.streamUrl = track.stream_url;
            }

            return {
              id: track.id,
              type: 'soundcloud-track',
              attributes: track
            };
          }),
        });


        let tracks = soundcloudTracks.map((soundcloudTrack) => {
          let track = store.createRecord('track');
          track.createFromSoundcloudTrack(soundcloudTrack);
          return track;
        });

        mix.save().then(() => {
          // TODO: appendTracksWithTransitions
          executePromisesInSeries(tracks.map((track) => {
            mix.appendModelWithTransition(track);
          })).then(() => {
            this.transitionTo('mix', mix);
          });
        });
      });
    },
  },

  soundcloud: Ember.inject.service(),

  setupController(controller, models) {
    controller.setProperties(models);
  },

  model: function() {
    return Ember.RSVP.hash({
      mixes: this.get('store').findAll('mix'),
      tracks: this.get('store').findAll('track'),
    });
  }
});
