import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';

export default DS.Model.extend(
  AbstractListMixin('mix-item'), {

  title: DS.attr('string'),

  createTransitionAt: function(index) {
    var fromTrack = this.trackAt(index);
    var toTrack = this.trackAt(index + 1);

    if (!(fromTrack && toTrack)) {
      throw new Error("Cannot create transition without fromTrack and toTrack");
    }

    var transition = this.get('store').createRecord('transition');
    transition.set('fromTrack', fromTrack);
    transition.set('toTrack', toTrack);

    return transition;
  },

  transitionAt: function(index) {
    var mixItem = this.objectAt(index);
    return mixItem && mixItem.get('transition');
  },

  trackAt: function(index) {
    var mixItem = this.objectAt(index);
    return mixItem && mixItem.get('track');
  },

  insertTrackAt: function(index, track) {
    var item = this.assertItemAt(index);

    item.set('track', track);
  },

  assertItemAt: function(index) {
    var item = this.objectAt(index);

    if (!item) {
      item = this.createItemAt(index);
      item.save();
    }

    return item;
  },

});
