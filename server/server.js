Songs = new Meteor.Collection("Songs");
Transitions = new Meteor.Collection("Transitions");

//
// server
//
Meteor.startup(function () {
  Songs.remove({});
  Transitions.remove({});

  var transitions = [], songs = {};

  if (Transitions.find().count() === 0) {

    // inital transitions TODO make this not hardcoded... use mixxx's db?
    transitions = [
    {
      startSong: "reach for me",
      startTime: 192.353714,
      endSong: "i could be the one",
      endTime: 107.620399,
      type: "wav"
    },

    {
      startSong: "i could be the one",
      startTime: 380.738556,
      endSong: "alive",
      endTime: 34.396709,
      type: "wav"
    },

    {
      startSong: "alive",
      startTime: 250.603012,
      endSong: "torrent",
      endTime: 62.447994,
      type: "wav"
    },

    {
      startSong: "torrent",
      startTime: 143.641342,
      endSong: "without you",
      endTime: 171.131622,
      type: "wav"
    },

    {
      startSong: "torrent",
      startTime: 144.216965,
      endSong: "quasar",
      endTime: 209.397522,
      type: "wav"
    },

    {
      startSong: "without you",
      startTime: 276.077362,
      endSong: "miami",
      endTime: 77.067917,
      type: "wav"
    },

    {
      startSong: "without you",
      startTime: 279.443787,
      endSong: "baker street",
      endTime: 88.610138,
      type: "wav"
    },

    {
      startSong: "miami",
      startTime: 143.402145,
      endSong: "ultraviolet",
      endTime: 220.827164,
      type: "wav"
    },

    {
      startSong: "miami",
      startTime: 164.153366,
      endSong: "without you",
      endTime: 137.536957,
      type: "wav"
    },

    {
      startSong: "ultraviolet",
      startTime: 333.104248,
      endSong: "babylon",
      endTime: 109.693863,
      type: "wav"
    },

    {
      startSong: "babylon",
      startTime: 220.245621,
      endSong: "dont you worry child",
      endTime: 89.395668,
      type: "wav"
    },

    {
      startSong: "dont you worry child",
      startTime: 198.945801,
      endSong: "alive",
      endTime: 144.281357,
      type: "wav"
    },

    {
      startSong: "dont you worry child",
      startTime: 354.241913,
      endSong: "without you",
      endTime: 42.679478,
      type: "wav"
    },

    {
      startSong: "dont you worry child",
      startTime: 351.336517,
      endSong: "years",
      endTime: 34.668739,
      type: "wav"
    },

    {
      startSong: "everafter",
      startTime: 251.031448,
      endSong: "years",
      endTime: 47.861614,
      type: "wav"
    },

    {
      startSong: "years",
      startTime: 208.427948,
      endSong: "easy",
      endTime: 35.244785,
      type: "wav"
    },

    {
      startSong: "years",
      startTime: 203.284836,
      endSong: "dont you worry child",
      endTime: 63.690960,
      type: "wav"
    },

    {
      startSong: "dont you worry child",
      startTime: 352.708984,
      endSong: "skylarking",
      endTime: 153.944778,
      type: "wav"
    },

    {
      startSong: "i could be the one",
      startTime: 201.063812,
      endSong: "skylarking",
      endTime: 257.211761,
      type: "wav"
    },

    {
      startSong: "skylarking",
      startTime: 529.551392,
      endSong: "ultraviolet",
      endTime: 126.058815,
      type: "wav"
    },

    {
      startSong: "skylarking",
      startTime: 530.919739,
      endSong: "language",
      endTime: 65.866142,
      type: "wav"
    },

    {
      startSong: "i could be the one",
      startTime: 199.788696,
      endSong: "language",
      endTime: 184.109070,
      type: "wav"
    },

    {
      startSong: "kawaii",
      startTime: 222.738846,
      endSong: "language",
      endTime: 285.191101,
      type: "wav"
    },

    {
      startSong: "reach for me",
      startTime: 190.265793,
      endSong: "kawaii",
      endTime: 113.981590,
      type: "wav"
    },

    {
      startSong: "kawaii",
      startTime: 291.221283,
      endSong: "reach for me",
      endTime: 60.380409,
      type: "wav"
    },

    {
      startSong: "i could be the one",
      startTime: 199.254166,
      endSong: "apollo",
      endTime: 164.703293,
      type: "wav"
    },

    {
      startSong: "alive",
      startTime: 132.584869,
      endSong: "apollo",
      endTime: 36.821423,
      type: "wav"
    },

    {
      startSong: "apollo",
      startTime: 275.805481,
      endSong: "alive",
      endTime: 32.706635,
      type: "wav"
    },

/*  TODO: can't currently have a multi-edge. need to fix this!
    {
      startSong: "apollo",
      startTime: 152.975479,
      endSong: "alive",
      endTime: 142.088867,
      type: "wav"
    },
*/

    {
      startSong: "language",
      startTime: 146.066269,
      endSong: "apollo",
      endTime: 318.223175,
      type: "wav"
    },

    {
      startSong: "kawaii",
      startTime: 353.922760,
      endSong: "lamour",
      endTime: 59.626980,
      type: "wav"
    },

    {
      startSong: "language",
      startTime: 328.101379,
      endSong: "reach for me",
      endTime: 124.436142,
      type: "wav"
    },

    {
      startSong: "everafter",
      startTime: 265.026215,
      endSong: "miami",
      endTime: 113.713356,
      type: "wav"
    },

    {
      startSong: "language",
      startTime: 318.478607,
      endSong: "everafter",
      endTime: 49.072037,
      type: "wav"
    },

    {
      startSong: "everafter",
      startTime: 272.479156,
      endSong: "babylon",
      endTime: 71.089394,
      type: "wav"
    },

    {
      startSong: "ultraviolet",
      startTime: 315.227356,
      endSong: "everafter",
      endTime: 66.223885,
      type: "wav"
    },

    {
      startSong: "ultraviolet",
      startTime: 331.923798,
      endSong: "skylarking",
      endTime: 366.263641,
      type: "wav"
    },

    {
      startSong: "quasar",
      startTime: 196.249542,
      endSong: "lamour",
      endTime: 41.658463,
      type: "wav"
    },

    {
      startSong: "without you",
      startTime: 158.246216,
      endSong: "lamour",
      endTime: 42.087124,
      type: "wav"
    },

    {
      startSong: "lamour",
      startTime: 234.897583,
      endSong: "miami",
      endTime: 80.305382,
      type: "wav"
    },

    {
      startSong: "lamour",
      startTime: 238.838669,
      endSong: "torrent",
      endTime: 69.051605,
      type: "wav"
    },

    {
      startSong: "torrent",
      startTime: 142.898361,
      endSong: "every teardrop",
      endTime: 11.174557,
      type: "wav"
    },

    {
      startSong: "every teardrop",
      startTime: 222.706573,
      endSong: "language",
      endTime: 196.782166,
      type: "wav"
    },

    {
      startSong: "every teardrop",
      startTime: 333.936188,
      endSong: "torrent",
      endTime: 64.156013,
      type: "wav"
    },

    {
      startSong: "apollo",
      startTime: 265.420898,
      endSong: "every teardrop",
      endTime: 74.284897,
      type: "wav"
    },

    {
      startSong: "easy",
      startTime: 357.774994,
      endSong: "quasar",
      endTime: 63.398247,
      type: "wav"
    },

    {
      startSong: "easy",
      startTime: 355.803040,
      endSong: "baker street",
      endTime: 64.683037,
      type: "wav"
    },

    {
      startSong: "miami",
      startTime: 223.972519,
      endSong: "baker street",
      endTime: 128.925186,
      type: "wav"
    },

    {
      startSong: "baker street",
      startTime: 293.230835,
      endSong: "babylon",
      endTime: 66.717758,
      type: "wav"
    },

    {
      startSong: "baker street",
      startTime: 292.745270,
      endSong: "miami",
      endTime: 78.651230,
      type: "wav"
    },

    {
      startSong: "babylon",
      startTime: 234.398346,
      endSong: "quasar",
      endTime: 53.055809,
      type: "wav"
    },

    {
      startSong: "quasar",
      startTime: 197.797333,
      endSong: "skylarking",
      endTime: 207.232025,
      type: "wav"
    },

    {
      startSong: "quasar",
      startTime: 190.835098,
      endSong: "torrent",
      endTime: 166.534515,
      type: "wav"
    },

    {
      startSong: "quasar",
      startTime: 340.086792,
      endSong: "baker street",
      endTime: 64.889488,
      type: "wav"
    },

    {
      startSong: "lamour",
      startTime: 234.202515,
      endSong: "apollo",
      endTime: 37.440605,
      type: "wav"
    },

    {
      startSong: "torrent",
      startTime: 277.748840,
      endSong: "lamour",
      endTime: 35.708584,
      type: "wav"
    },

    {
      startSong: "blank",
      startTime: 1000000,
      endSong: "blank",
      endTime: 1000000,
      type: "wav"
    }

      ];

    transitions.forEach(function (transition) {
      Transitions.insert(transition);
    });
  }

  if (Songs.find().count() === 0) {

    // inital songs TODO make this not hardcoded... use mixxx's db?
    Transitions.find().fetch().forEach(function (transition) {
      songs[transition.startSong] || (songs[transition.startSong] = { name: transition.startSong, type: "mp3" });
      songs[transition.endSong] || (songs[transition.endSong] = { name: transition.endSong, type: "mp3" });
    });

    for (var songName in songs) {
      var song = songs[songName];
      song['playCount'] = 0;
      Songs.insert(song);
    }
  }
  console.log("Transition Count: "+Transitions.find().count());
  console.log("Song Count: "+Songs.find().count());
});
