Meteor.publish("Songs", function () {
  return Songs.find();
});
