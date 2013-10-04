Transitions = new Meteor.Collection("Transitions");
Transitions.allow({

  insert: function (userId, transition) {
    return (userId === Meteor.users.findOne({ username: 'test'})._id);
  },

  update: function (userId, transitions, fields, modifier) {
    return (userId === Meteor.users.findOne({ username: 'test'})._id);
  },

  remove: function (userId, transitions) {
    return false;
  }

});
