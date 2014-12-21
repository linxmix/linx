Mixes = new Meteor.Collection('Mixes', {
  schema: {
    title: {
      type: String,
      label: 'Title',
    },
    tracks: {
      type: [String],
      label: 'Tracks',
    }
  }
});

Mixes.allow({
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
