import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';
import DependentModelMixin from 'linx/lib/models/dependent-model';

export default DS.Model.extend(
  AbstractListMixin('mix-list-item'),
  DependentModelMixin('track-list'), {

  title: DS.attr('string'),

  seedList: Ember.computed.alias('track-list'),

  // params
  tracks: Ember.computed.mapBy('track'),
  transitions: Ember.computed.mapBy('transitions'), // TODO: remove null/undefined?

  createTransitionAt: function(index) {
    var fromTrack = this.trackAt(index);
    var toTrack = this.trackAt(index + 1);

    if (!(fromTrack && toTrack)) {
      throw new Error("Cannot create transition without fromTrack and toTrack");
    }

    var transition = this.get('store').createRecord('transition');
    transition.set('fromTrack', fromTrack);
    transition.set('toTrack', toTrack);

    return transition.save().then(() => {
      this.insertTransitionAt(index, transition);
      return transition;
    });
  },

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
