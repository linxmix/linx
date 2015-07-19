import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';

export default DS.Model.extend(
  AbstractListMixin('mix-list-item'), {

  title: DS.attr('string'),

  seedList: DS.belongsTo('track-list', { async: true, dependent: true }),

  // params
  tracks: Ember.computed.mapBy('items', 'track'),
  transitions: Ember.computed.mapBy('items', 'transitions'), // TODO: remove null/undefined?

  appendTransition: function(transition) {
    this.insertTransitionAt(this.get('length'), transition);
  },

  transitionAt: function(index) {
    var mixItem = this.objectAt(index);
    return mixItem && mixItem.get('transition');
  },

  trackAt: function(index) {
    var mixItem = this.objectAt(index);
    return mixItem && mixItem.get('track');
  },

  appendTrack: function(track) {
    this.insertTrackAt(this.get('length'), track);
  },

  // TODO: mix needs to validate transitions when inserting tracks
  insertTrackAt: function(index, track) {
    var mixItem = this.assertItemAt(index);
    console.log("insertTrackAt", index, track.get('title'));
    mixItem.set('track', track);
    mixItem.save();
  },

  // TODO: mix needs to validate transitions when inserting transition
  // TODO: if adding transition to end, add toTrack as well
  insertTransitionAt: function(index, transition) {
    var mixItem = this.assertItemAt(index);
    mixItem.set('transition', transition);
    mixItem.save();
  },

  // TODO: mix needs to validate transitions when removing tracks
  removeTrack: function(track) {
    var item = this.get('items').find((item) => {
      return item.get('track.id') === track.get('id');
    });
    var index = item && item.get('index');

    if (!Ember.isNone(index)) {
      return this.removeTrackAt(index);
    }
  },

  // TODO: mix needs to validate transitions when removing tracks
  removeTrackAt: function(index) {
    this.removeAt(index);
  },

  removeTransition: function(transition) {
    var item = this.get('items').find((item) => {
      return item.get('transition.id') === transition.get('id');
    });
    var index = item && item.get('index');

    if (!Ember.isNone(index)) {
      return this.removeTransitionAt(index);
    }
  },

  removeTransitionAt: function(index) {
    var mixItem = this.objectAt(index);
    mixItem && mixItem.set('transition', null);
    mixItem.save();
  },

});
