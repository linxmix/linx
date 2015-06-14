import Ember from 'ember';
import DS from 'ember-data';
// import DependentModel from 'linx/lib/models/dependent-model';

export default DS.Model.extend({
  // DependentModel('arrangement'), {

  fromTime: DS.attr('number'), // end time of fromTrack
  toTime: DS.attr('number'), // start time of toTrack

  arrangement: DS.belongsTo('arrangement', { async: true }),
  fromTrack: DS.belongsTo('track', { async: true }),
  toTrack: DS.belongsTo('track', { async: true }),
  mixListItems: DS.hasMany('mix-list-item', { async: true }),

  // sets the arrangement for this transition to have:
  // fromTrack on first row, toTrack on second
  // simple tempo curve [ TODO ]
  // simple volume curve [ TODO ]
  // TODO: delete old arrangement, if exists?
  initSimpleArrangement: function() {
    Ember.RSVP.all([this.get('fromTrack'), this.get('toTrack')]).then((results) => {
      var store = this.get('store');
      var fromTrack = results[0];
      var toTrack = results[1];
      var arrangement = this.get('store').createRecord('arrangement', {
        totalBeats: 64, // TODO: make 64 the default numBeats?
      });

      console.log("createSimpleArrangement", fromTrack.get('title'), toTrack.get('title'), arrangement);
      this.set('arrangement', arrangement);

      // create tracks' clips and rows
      var fromRow = arrangement.createRow();
      var fromClip = store.createRecord('audio-clip', { track: fromTrack });
      fromRow.createClip({ start: 0, clip: fromClip });

      var toRow = arrangement.createRow();
      var toClip = store.createRecord('audio-clip', { track: toTrack });
      toRow.createClip({ start: 0, clip: toClip });

      var savePromises = [fromClip.save(), toClip.save(), arrangement.save()];
      Ember.RSVP.all(savePromises).then((results) => {
        this.save();
      });
    });
  }
});
