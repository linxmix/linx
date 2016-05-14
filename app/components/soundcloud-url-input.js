import Ember from 'ember';

import { EKMixin, EKOnInsertMixin, keyDown } from 'ember-keyboard';

export default Ember.TextField.extend(
  EKMixin,
  EKOnInsertMixin, {

  // expected params
  addTrack: Ember.K,

  // overrides
  placeholder: 'Add Soundcloud Url',

  store: Ember.inject.service(),

  _resolveUrl: Ember.on(keyDown('Enter'), function() {
    const store = this.get('store');

    store.queryRecord('soundcloud/track', {
      resolveUrl: this.get('value')
    }).then((soundcloudTrack) => {

      // TODO(TECHDEBT): should be able to soundcloudTrack.getTrack
      const track = store.createRecord('track')
      track.createFromSoundcloudTrack(soundcloudTrack);

      this.get('addTrack')(track);
    }, (error) => {
      Ember.Logger.warn('error with resolveUrl', error);
    });
  }),
});
