import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';
import withDefaultModel from 'linx/lib/computed/with-default-model';
import filterEmpty from 'linx/lib/computed/filter-empty';
import { flatten } from 'linx/lib/utils';
import add from 'linx/lib/computed/add';

export default DS.Model.extend(
  AbstractListMixin('mix-item', { polymorphic: true }), {

  title: DS.attr('string'),

  // params
  tracks: function() {
    return flatten(this.get('items').mapBy('tracks'));
  }.property('items.@each.tracks'),
  transitions: Ember.computed.mapBy('items', 'transition.content'),
  nonEmptyTransitions: filterEmpty('transitions'),

  numTracks: Ember.computed.alias('tracks.length'),
  numTransitions: Ember.computed.alias('nonEmptyTransitions.length'),

  numBeats: Ember.computed.alias('items.lastObject.endBeat'),

  // adds arrangements when appending given transition
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

  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    return this.get('store').createRecord('arrangement');
  }),
});
