Transitions = new Meteor.Collection('Transitions');
TransitionModel = Model(Transitions);

TransitionModel.extend(TrackModel);

TransitionModel.extend({
  defaultValues: {},

  getLinxType: function() {
    return 'transition';
  },

  getSongsIn: function(endTime) {
    // TODO
  },

  getSongsOut: function(startTime) {
    // TODO
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
