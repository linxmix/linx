Meteor.publish("songs", function () {
  return Songs.find();
});

Meteor.publish("transitions", function () {
  return Transitions.find();
});