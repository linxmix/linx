MixPoints = new Meteor.Collection('MixPoints');
MixPointModel = Model(MixPoints);

MixPointModel.extend(LinxModel);

MixPointModel.extend({
  defaultValues: {
    type: '', // 'in' or 'out'
    inTrack: null, // object with id and linxType
    outTrack: null, // object with id and linxType
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
