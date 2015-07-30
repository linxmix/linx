import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';
import withDefaultModel from 'linx/lib/computed/with-default-model';

export default DS.Model.extend(
  AbstractListMixin('mix-list-item'), {

  title: DS.attr('string'),

  arrangement: function() {
    // TODO(NOW): generate from tracks and transitions
  }.property('foo'),

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

  // TODO: validate transitions after
  insertTrackAt: function(index, track) {
    console.log("insertTrackAt", index, track.get('title'));
    var mixItem = this.assertItemAt(index);
    return mixItem.insertTrack(track);
  },

  // TODO: if adding transition to end, add toTrack as well
  // TODO: check mixItem.isValidTransition
  insertTransitionAt: function(index, transition) {
    console.log("insertTransitionAt", index, transition);
    var mixItem = this.assertItemAt(index);
    return mixItem.insertTransition(transition);
  },

  createTransitionAt: function(index) {
    console.log("createTransitionAt", index);
    var mixItem = this.assertItemAt(index);
    return mixItem.createTransition();
  }.

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
    var mixItem = this.objectAt(index);
    return mixItem && mixItem.removeTrack();
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
    return mixItem && mixItem.removeTransition();
  },

});
