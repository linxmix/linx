Utils = {
  clientId_Soundcloud: '977ed530a2104a95eaa87f26fa710941',

  // migrate transitions from linx meteor v1 to linx meteor v2
  migrateTransitions: function(transitions) {
    transitions.forEach(function(transition) {
      transition.outId = transition.endSong;
      delete transition.endSong;
      transition.startOut = transition.endSongStart;
      delete transition.endSongStart;
      transition.endEdge = transition.endTime;
      delete transition.endTime;
      transition.inId = transition.startSong;
      delete transition.startSong;
      transition.endIn = transition.startSongEnd;
      delete transition.startSongEnd;
      transition.startEdge = transition.startTime;
      delete transition.startTime;

      var _id = transition._id;
      delete transition._id;
      Transitions.update(_id, {
        $set: transition,
        $unset: {
          endSong: '',
          endSongStart: '',
          endTime: '',
          startSong: '',
          startSongEnd: '',
          startTime: '',
        },
      });
    });
  }
};
