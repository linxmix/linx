import Ember from 'ember';
import DS from 'ember-data';
import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';

export default DS.Model.extend({
  // OrderedHasManyMixin('track-list-item'), {

  tracks: Ember.computed.mapBy('items', 'track'),

  addTrack: function(track) {
    return this.appendItem({
      track: track
    });
  },

  removeTrack: function(track) {
    var item = this.get('items').findBy('track.id', track.get('id'));

    if (!Ember.isNone(item)) {
      return this.removeObject(item);
    }
  },

  save: function() {
    console.log('save track-list', this.get('id'));
    return this._super.apply(this, arguments);
  }
});
