Songs = new Meteor.Collection('Songs', {
  schema: {
    title: {
      type: String,
      label: 'Title',
    },
    artist: {
      type: String,
      label: 'Artist',
    },
  }
});

Songs.allow({
  insert: function (userId, match) {
    return true;
  },
  update: function (userId, matches, fields, modifier) {
    return true;
  },
  remove: function (userId, matches) {
    return true;
  }
});