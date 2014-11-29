Meteor.publish("tracks", function () {
  return Tracks.find();
});
