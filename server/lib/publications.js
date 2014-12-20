Meteor.publish("Songs", function () {
  return Songs.find();
});

Meteor.publish("Transitions", function () {
  return Transitions.find();
});

Meteor.publish("Mixes", function () {
  return Mixes.find();
});
