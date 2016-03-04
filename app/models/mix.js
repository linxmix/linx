import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';

export default DS.Model.extend(
  PlayableArrangementMixin,
  OrderedHasManyMixin('_mixItems', 'mix/item'), {

  title: DS.attr('string'),
  timeSignature: DS.attr('number', { defaultValue: 4.0 }),
  _mixItems: DS.hasMany('mix/item', { async: true }),

  // implement playable-arrangement
  session: Ember.inject.service(),
  audioContext: Ember.computed.reads('session.audioContext'),

  tracks: Ember.computed.mapBy('items', 'track.content'),
  transitions: Ember.computed.mapBy('items', 'transition.content'),

  trackClips: Ember.computed.mapBy('items', 'trackClip'),
  transitionClips: Ember.computed.mapBy('items', 'transitionClip'),
  clips: Ember.computed.uniq('trackClips', 'transitionClips'),

  trackAt(index) {
    let item = this.objectAt(index);
    return item && item.get('track.content');
  },

  insertTrackAt(index, track) {
    const item = this.createAt(index);

    return item.setTrack(track);
  },

  insertTracksAt(index, tracks) {
    const items = tracks.map((track) => {
      const item = this.createItem();
      return item.setTrack(track);
    });

    // TODO(REFACTOR2): possible bug with items being proxies
    return Ember.RSVP.all(items).then((items) => {
      return this.replace(index, 0, items);
    });
  },

  appendTrack(track) {
    return this.insertTrackAt(this.get('length'), track);
  },

  appendTracks(tracks) {
    return this.insertTracksAt(this.get('length'), tracks);
  },
});
