import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';
import withDefaultModel from 'linx/lib/computed/with-default-model';

export default DS.Model.extend(
  AbstractListMixin('mix-list-item'), {

  title: DS.attr('string'),

  // params
  length: Ember.computed.alias('items.length'),
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

  // dynamically recomputes this mix's arrangement based on tracks and transitions
  arrangement: function() {
    var store = this.get('store');
    var arrangement = store.createRecord('arrangement');

    // generate from tracks and transitions
    var currBeat = 0; // cursor in arrangement
    var items = this.get('items');
    for (var i = 0; i < items.get('length'); i++) {
      var prevItem = items.objectAt(i - 1);
      var item = items.objectAt(i);
      var nextItem = items.objectAt(i + 1);
      var track = item.get('track');

      // add track to arrangement
      var trackLengthBeats = item.get('trackLengthBeats');
      var trackClip = store.createRecord('track-clip', {
        track: track,
        startBeat: item.get('trackStartBeat'),
        lengthBeats: trackLengthBeats
      });
      var trackArrangementItem = arrangement.appendItem({
        clip: trackClip,
        startBeat: currBeat,
      });
      currBeat += trackLengthBeats;

      // TODO(TRANSITION): then add transition
      if (item.get('hasValidTransition')) {
        // arrangement.appendArrangement(currBeat, item.get('transition.template'));
        // currBeat += item.get('transitionLengthBeats');
      }
    }

    return arrangement;
  }.property('items.@each.track', 'items.@each.trackStartBeat', 'items.@each.trackLengthBeats', 'items.@each.transitionLengthBeats'),

});
