Songs = new Meteor.Collection("Songs");
Transitions = new Meteor.Collection("Transitions");

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

if (Meteor.isClient) {
  Meteor.subscribe("Songs");
  Meteor.subscribe("Transitions");
} else {
  Meteor.publish("Songs", function() {
    return Songs.find();
  });
  Meteor.publish("Transitions", function() {
    return Transitions.find();
  });
}
