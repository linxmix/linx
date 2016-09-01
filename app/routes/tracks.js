import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller, models) {
    controller.setProperties(models);
  },

  model: function() {
    return {
      tracks: this.get('store').findAll('track'),
      favoriteTracks: this.get('soundcloud').getAjax('/users/37450820/favorites', {
        page_size: 2000,
      }).then((soundcloudJson) => {

        // TODO: finish
        // const store = this.get('store');

        // console.log('soundcloudJson', soundcloudJson);
        // store.pushPayload('soundcloud/track', {
        //   soundcloudTracks: soundcloudJson
        // });

        // const soundcloudTracks = store.findAll('soundcloud/track');

        // console.log('soundcloudTracks', soundcloudTracks);
        // const tracks = soundcloudTracks.map((soundcloudTrack) => {
        //   const track = store.createRecord('track')
        //   track.createFromSoundcloudTrack(soundcloudTrack);
        //   return track;
        // });
        // console.log('tracks', tracks);

        // return tracks;

      })
    };
  },

  soundcloud: Ember.inject.service(),
});
