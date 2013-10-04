Songs = new Meteor.Collection("Songs");
Songs.allow({

  insert: function (userId, song) {
    return (userId === Meteor.users.findOne({ username: 'test'})._id);
  },

  update: function (userId, songs, fields, modifier) {
    return (userId === Meteor.users.findOne({ username: 'test'})._id);
  },

  remove: function (userId, songs) {
    return false;
  }

});
