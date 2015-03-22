Meteor.publish("Tracks", function () {
  return Tracks.find();
});

Meteor.publish("Links", function () {
  return Links.find();
});

Meteor.publish("Mixes", function () {
  return Mixes.find();
});

Meteor.startup(function() {
  if (!Mixes.findOne('queue')) {
    Mixes.insert({_id: 'queue', name: 'Queue'});
  }
});
