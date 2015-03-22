// Transitions = new Meteor.Collection('Transitions');
// TransitionModel = Model(Transitions);

// TransitionModel.extend(TrackModel);

// TransitionModel.extend({
//   defaultValues: {
//     linxType: 'transition',
//   },

//   getInSong: function() {
//     return Songs.findOne(this.inId);
//   },

//   getOutSong: function() {
//     return Songs.findOne(this.outId);
//   },

//   getLinxType: function() {
//     return this.linxType;
//   },

//   getInSongs: function(endTime) {
//     // TODO
//   },

//   getOutSongs: function(startTime) {
//     // TODO
//   }
// });

// Transitions.allow({
//   insert: function (userId, doc) {
//     return true;
//   },
//   update: function (userId, docs, fields, modifier) {
//     return true;
//   },
//   remove: function (userId, docs) {
//     return true;
//   }
// });
