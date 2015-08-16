import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';
import withDefaultModel from 'linx/lib/computed/with-default-model';
import filterEmpty from 'linx/lib/computed/filter-empty';

export default DS.Model.extend(
  AbstractListMixin('mix-list-item'), {

  title: DS.attr('string'),

  // params
  tracks: Ember.computed.mapBy('items', 'track.content'),
  transitions: Ember.computed.mapBy('items', 'transition.content'),
  nonEmptyTransitions: filterEmpty('transitions'),

  numTracks: Ember.computed.alias('tracks.length'),
  numTransitions: Ember.computed.alias('nonEmptyTransitions.length'),

  // adds tracks when appending given transition
  appendTransitionWithTracks: function(transition) {
    var index = this.get('length');
    var prevTrack = this.trackAt(index - 1);
    var promises = [];

    var fromTrack = transition.get('fromTrack');
    var toTrack = transition.get('toTrack');

    // if prevTrack matches fromTrack, use it
    if (prevTrack && prevTrack.get('id') === fromTrack.get('id')) {
      index -= 1;

    // otherwise, just add fromTrack
    } else {
      promises.push(this.insertTrackAt(index, fromTrack));
    }

    // then add transition and toTrack
    promises.push(this.insertTransitionAt(index, transition));
    promises.push(this.insertTrackAt(index + 1, toTrack));

    return Ember.RSVP.all(promises);
  },

  appendTrack: function(track) {
    return this.insertTrackAt(this.get('length'), track);
  },

  transitionAt: function(index) {
    return this.get('transitions').objectAt(index);
  },

  trackAt: function(index) {
    return this.get('tracks').objectAt(index);
  },

  insertTrackAt: function(index, track) {
    console.log("insertTrackAt", index, track.get('title'));
    var mixItem = this.createItemAt(index);
    return mixItem.insertTrack(track);
  },

  insertTransitionAt: function(index, transition) {
    console.log("insertTransitionAt", index, transition);
    var mixItem = this.objectAt(index);
    return mixItem && mixItem.insertTransition(transition);
  },

  removeTrack: function(track) {
    var item = this.get('items').findBy('track.id', track.get('id'));
    var index = item && item.get('index');

    if (Ember.isPresent(index)) {
      return this.removeTrackAt(index);
    }
  },

  removeTrackAt: function(index) {
    var mixItem = this.objectAt(index);
    return mixItem && mixItem.removeTrack();
  },

  removeTransition: function(transition) {
    var item = this.get('items').findBy('transition.id', transition.get('id'));
    var index = item && item.get('index');

    if (Ember.isPresent(index)) {
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
      var numTrackBeats = item.get('numTrackBeats');
      var trackClip = store.createRecord('track-clip', {
        mixItem: item
      });
      var trackArrangementItem = arrangement.appendItem({
        clip: trackClip,
        startBeat: currBeat,
      });
      currBeat += numTrackBeats;

      // TODO(TRANSITION): then add transition
      if (item.get('hasValidTransition')) {
        // arrangement.appendArrangement(currBeat, item.get('transition.template'));
        // currBeat += item.get('transitionLengthBeats');
      }
    }

    return arrangement;
  }.property('items.@each.track', 'items.@each.trackStartBeat', 'items.@each.numTrackBeats', 'items.@each.transitionLengthBeats'),

});
