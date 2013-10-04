Transitions = new Meteor.Collection("Transitions");
Transitions.allow({

  insert: function (userId, transition) {
    var bool = (userId === Meteor.users.findOne({ username: 'test'})._id);
    if (!bool) {
      alert("Sorry, but you cannot stream music unless you're logged into an account that owns it. If you'd like to help test this app, contact wolfbiter@gmail.com.");
    }
    return bool;
  },

  update: function (userId, transitions, fields, modifier) {
    return (userId === Meteor.users.findOne({ username: 'test'})._id);
  },

  remove: function (userId, transitions) {
    return false;
  }

});
