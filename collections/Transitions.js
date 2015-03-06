Transitions = new Meteor.Collection('Transitions');
TransitionModel = Model(Transitions);

TransitionModel.extend({
  defaultValues: {},

  getS3Url: function() {
    var part = 'http://s3-us-west-2.amazonaws.com/linx-music';
    // TODO: make this work for non-mp3
    return part + '/transitions/' + this._id + '.mp3';
  },

  getStreamUrl: function(source) {
    return this.getS3Url();
  },

  getSource: function() {
    return 's3';
  },

  getLinxType: function() {
    return 'transition';
  },

  getSongsIn: function(endTime) {
    // TODO
  },

  getSongsOut: function(startTime) {
    // TODO
  }
});

Transitions.allow({
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
