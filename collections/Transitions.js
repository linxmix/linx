Transitions = new Meteor.Collection('Transitions', {
  schema: {
    _id: {
      type: String,
      label: 'Id',
    },
    type: {
      type: String,
      defaultValue: 'transition',
    },
    transitionType: {
      type: String,
      defaultValue: 'soft',
    },

    title: {
      type: String,
      label: 'Title',
    },
    dj: {
      type: String,
      label: 'DJ',
    },

    inId: {
      type: String
    },
    outId: {
      type: String
    },
    endIn: {
      type: Number
    },
    startEdge: {
      type: Number
    },
    endEdge: {
      type: Number
    },
    startOut: {
      type: Number
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
