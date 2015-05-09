var defaultParams = {
  // isNew: false,
};

Meteor.publish("Tracks", function () {
  return this.userId ? Tracks.find(defaultParams) : this.ready();
});

Meteor.publish("Links", function () {
  return this.userId ? Links.find(defaultParams) : this.ready();
});

Meteor.publish("Mixes", function () {
  return this.userId ? Mixes.find(defaultParams) : this.ready();
});

Meteor.publish("MixElements", function () {
  return this.userId ? MixElements.find(defaultParams) : this.ready();
});

Meteor.publish("Plays", function () {
  return this.userId ? Plays.find(defaultParams) : this.ready();
});

Meteor.publish("userData", function () {
  return this.userId ? Meteor.users.find(defaultParams) : this.ready();
});
