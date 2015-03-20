MixPoints = new Meteor.Collection('MixPoints');
MixPointModel = Model(MixPoints);

MixPointModel.extend(LinxModel);

MixPointModel.extend({
  defaultValues: {
    type: '', // 'in' or 'out'
    endIn: 0, // end time of inTrack
    startOut: 0, // start time of outTrack
    inId: null, // _id of inTrack
    inLinxType: null, // linxType of inTrack
    outId: null, // _id of outTrack
    outLinxType: null, // linxType of outTrack
  },

  getStart: function(trackId) {
    if (this.inId === trackId) {
      return this.endIn;
    } else if (this.outId === trackId) {
      return this.startOut;
    } else {
      throw Error("Error: could not get start for MixPoint with track: " + trackId);
    }
  },

  getInTrack: function() {
    return Songs.findOne(this.inId);
  },

  getOutSong: function() {
    return Songs.findOne(this.outId);
  },

  getLinxType: function() {
    return this.linxType;
  },

  getInSongs: function(endTime) {
    // TODO
  },

  getOutSongs: function(startTime) {
    // TODO
  }
});

MixPoints.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, docs, fields, modifier) {
    return true;
  },
  remove: function (userId, docs) {
    return true;
  }
});
