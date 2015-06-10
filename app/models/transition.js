import Ember from 'ember';
import DS from 'ember-data';
import DependentModel from 'linx/lib/models/dependent-model';

export default DS.Model.extend(
  DependentModel('arrangement'), {

  fromTime: DS.attr('number'), // end time of fromTrack
  toTime: DS.attr('number'), // start time of toTrack

  fromTrack: DS.belongsTo('track', { async: true }),
  toTrack: DS.belongsTo('track', { async: true }),
  mixListItems: DS.hasMany('mix-list-item', { async: true }),

  // sets the arrangement for this transition to have:
  // fromTrack on first row, toTrack on second
  // simple tempo curve [ TODO ]
  // simple volume curve [ TODO ]
  initSimpleArrangement: function() {
    Ember.RSVP.all([this.get('fromTrack'), this.get('toTrack'), this.get('arrangement')]).then((results) => {
      var store = this.get('store');
      var fromTrack = results[0];
      var toTrack = results[1];
      var arrangement = results[2];
      console.log("createSimpleArrangement", fromTrack.get('title'), toTrack.get('title'), arrangement);

      // clear existing arrangement
      arrangement.clear(); // also destroyClips?
      arrangement.set('totalBeats', 64); // TODO: make 64 the default numBeats

      // create tracks' clips and rows
      var fromRow = arrangement.createRow();
      var fromClip = store.createRecord('audio-clip', { track: fromTrack });
      var fromItem = fromRow.createItem({ start: 0, clip: fromClip });

      var toRow = arrangement.createRow();
      var toClip = store.createRecord('audio-clip', { track: toTrack });
      var toItem = toRow.createItem({ start: 0, clip: toClip });

      var clipPromises = [fromClip.save(), toClip.save()];
      Ember.RSVP.all(clipPromises, (results) => {
        this.save();
      });
    });
  }
});
