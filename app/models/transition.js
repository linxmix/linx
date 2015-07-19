import Ember from 'ember';
import DS from 'ember-data';
import withDefaultModel from 'linx/lib/with-default-model';

export default DS.Model.extend({
  // TODO: deprecated?
  fromTime: DS.attr('number'), // end time of fromTrack
  toTime: DS.attr('number'), // start time of toTrack

  fromTrack: DS.belongsTo('track', { async: true }),
  toTrack: DS.belongsTo('track', { async: true }),
  mixListItems: DS.hasMany('mix-list-item', { async: true }),

  _arrangement: DS.belongsTo('arrangement', { async: true, dependent: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    return this.get('store').createRecord('arrangement');
  }),

  // TODO: delete old arrangement, if exists?
  initOverlap: function(fromTrack, toTrack) {
    if (!(fromTrack && toTrack)) {
      throw new Error("Cannot create transition without fromTrack and toTrack", fromTrack, toTrack);
    }

    // TODO(AFTERPROMISE): do this easier
    console.log('get arrangment');
    return this.get('arrangement').then((arrangement) => {
      var store = this.get('store');
      arrangement.clear();

      console.log(`createOverlapArrangement: ${fromTrack.get('title')} - ${toTrack.get('title')}`);

      var audioClips = [];
      var row = arrangement.createRow();

      // create fromTrack's clips
      var fromAudioClip = store.createRecord('audio-clip', {
        track: fromTrack,
        startBeat: 0,
        length: 32,
      });
      var fromArrangementClip = row.createClip({
        startBeat: 0,
        clip: fromAudioClip
      });
      audioClips.push(fromAudioClip);

      // create toTrack's clips
      var toAudioClip = store.createRecord('audio-clip', {
        track: toTrack,
        startBeat: 0,
        length: 32,
      });
      var toArrangementClip = row.createClip({
        startBeat: 16,
        clip: toAudioClip
      });
      audioClips.push(toAudioClip);

      var savePromises = audioClips.map(function(clip) { return clip.save(); });
      return Ember.RSVP.all(savePromises).then((results) => {
        return this.save();
      });
    });
  }
});
