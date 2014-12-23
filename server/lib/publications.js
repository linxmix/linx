Meteor.publish("Songs", function () {
  return Songs.find();
});

Meteor.publish("Transitions", function () {
  return Transitions.find();
});

Meteor.publish("Mixes", function () {
  return Mixes.find();
});

Meteor.startup(function() {
  console.log("startup", Mixes.findOne('queue'));
  if (!Mixes.findOne('queue')) {
    Mixes.insert({_id: 'queue', name: 'queue'});
  }
});
