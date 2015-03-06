Transitions = new Meteor.Collection('Transitions');
TransitionModel = Model(Transitions);

TransitionModel.extend(TrackModel);

TransitionModel.extend({
  defaultValues: {
    linxType: 'transition',
  },

  getLinxType: function() {
    return this.linxType;
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
