Songs = new Meteor.Collection('Songs');
SongModel = Model(Songs);

SongModel.extend(TrackModel);

SongModel.extend({
  defaultValues: {
    linxType: 'song',
    source: 's3',
  },

  getLinxType: function() {
    return this.linxType;
  },

  getTransitionsIn: function(endTime) {
    // TODO
  },

  // TODO: augment for startTime
  getTransitionsOut: function(startTime) {
    return Transitions.find({inId: this._id}).fetch();
  },

  getSongsIn: function() {
    // TODO
  },

  // TODO: augment for startTime
  getSongsOut: function(startTime) {
    return this.getTransitionsOut(startTime).reduce(function(songs, transition) {
      songs.push(Songs.findOne(transition.outId));
      return songs;
    }, []);
  }
});

Songs.allow({
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
