Meteor.publish("Tracks", function () {
  return Tracks.find();
});

Meteor.publish("Links", function () {
  return Links.find();
});

Meteor.publish("Mixes", function () {
  return Mixes.find();
});

Meteor.publish("MixElements", function () {
  return MixElements.find();
});

Meteor.publish("Plays", function () {
  return Plays.find();
});
