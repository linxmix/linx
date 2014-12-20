Songs = new Meteor.Collection('Songs', {
  schema: {
    _id: {
      type: String,
      label: 'Id',
    },
    type: {
      type: String,
      defaultValue: 'song',
    },

    title: {
      type: String,
      label: 'Title',
    },
    artist: {
      type: String,
      label: 'Artist',
    },

    fileType: {
      type: String,
      label: 'FileType',
    },
    duration: {
      type: Number,
      label: 'Duration',
    },
    bitrate: {
      type: Number,
      label: 'Bitrate',
    },
    playCount: {
      type: Number,
      label: 'PlayCount',
    }
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
