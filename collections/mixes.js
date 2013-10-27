Mixes = new Meteor.Collection("Mixes");
Mixes.allow({

  insert: function (userId, mix) {
    return (userId === Meteor.users.findOne({ username: 'test'})._id);
  },

  update: function (userId, mixes, fields, modifier) {
    return (userId === Meteor.users.findOne({ username: 'test'})._id);
  },

  remove: function (userId, mixes) {
    return (userId === Meteor.users.findOne({ username: 'test'})._id);
  }

});
