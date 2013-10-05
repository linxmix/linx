//
// server
//
Meteor.startup(function () {

  try {
    Accounts.createUser({
      username: "test",
      email: "wolfbiter@gmail.com",
      password: "fairuse",
      profile: { name: "welcome" }
    });
  } catch (e) {
    console.log("test account already exists");
  }

  //
  // database stuff
  //
  Songs.remove({});
  Transitions.remove({});

  var transitions = [], songs = {};

  if (Transitions.find().count() === 0) {

    // inital transitions TODO make this not hardcoded... use mixxx's db?
    transitions = [
    {
      startSong: "reach for me",
      startSongEnd: 192.353714,
      endSong: "i could be the one",
      endSongStart: 107.620399,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "i could be the one",
      startSongEnd: 380.738556,
      endSong: "alive",
      endSongStart: 34.396709,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "alive",
      startSongEnd: 250.603012,
      endSong: "torrent",
      endSongStart: 62.447994,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "torrent",
      startSongEnd: 143.641342,
      endSong: "without you",
      endSongStart: 171.131622,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "torrent",
      startSongEnd: 144.216965,
      endSong: "quasar",
      endSongStart: 209.397522,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "without you",
      startSongEnd: 276.077362,
      endSong: "miami",
      endSongStart: 77.067917,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "without you",
      startSongEnd: 279.443787,
      endSong: "baker street",
      endSongStart: 88.610138,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "miami",
      startSongEnd: 143.402145,
      endSong: "ultraviolet",
      endSongStart: 220.827164,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "miami",
      startSongEnd: 164.153366,
      endSong: "without you",
      endSongStart: 137.536957,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "ultraviolet",
      startSongEnd: 333.104248,
      endSong: "babylon",
      endSongStart: 109.693863,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "babylon",
      startSongEnd: 220.245621,
      endSong: "dont you worry child",
      endSongStart: 89.395668,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "dont you worry child",
      startSongEnd: 198.945801,
      endSong: "alive",
      endSongStart: 144.281357,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "dont you worry child",
      startSongEnd: 354.241913,
      endSong: "without you",
      endSongStart: 42.679478,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "dont you worry child",
      startSongEnd: 351.336517,
      endSong: "years",
      endSongStart: 34.668739,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "everafter",
      startSongEnd: 251.031448,
      endSong: "years",
      endSongStart: 47.861614,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "years",
      startSongEnd: 208.427948,
      endSong: "easy",
      endSongStart: 35.244785,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "years",
      startSongEnd: 203.284836,
      endSong: "dont you worry child",
      endSongStart: 63.690960,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "dont you worry child",
      startSongEnd: 352.708984,
      endSong: "skylarking",
      endSongStart: 153.944778,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "i could be the one",
      startSongEnd: 201.063812,
      endSong: "skylarking",
      endSongStart: 257.211761,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "skylarking",
      startSongEnd: 529.551392,
      endSong: "ultraviolet",
      endSongStart: 126.058815,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "skylarking",
      startSongEnd: 530.919739,
      endSong: "language",
      endSongStart: 65.866142,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "i could be the one",
      startSongEnd: 199.788696,
      endSong: "language",
      endSongStart: 184.109070,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "kawaii",
      startSongEnd: 222.738846,
      endSong: "language",
      endSongStart: 285.191101,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "reach for me",
      startSongEnd: 190.265793,
      endSong: "kawaii",
      endSongStart: 113.981590,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "kawaii",
      startSongEnd: 291.221283,
      endSong: "reach for me",
      endSongStart: 60.380409,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "i could be the one",
      startSongEnd: 199.254166,
      endSong: "apollo",
      endSongStart: 164.703293,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "alive",
      startSongEnd: 132.584869,
      endSong: "apollo",
      endSongStart: 36.821423,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "apollo",
      startSongEnd: 275.805481,
      endSong: "alive",
      endSongStart: 32.706635,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

/*  TODO: can't currently have a multi-edge. need to fix this!
    {
      startSong: "apollo",
      startSongEnd: 152.975479,
      endSong: "alive",
      endSongStart: 142.088867,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },
*/
/*
    {
      startSong: "language",
      startSongEnd: 318.223175,
      endSong: "apollo",
      endSongStart: 146.066269,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },
    */

    {
      startSong: "kawaii",
      startSongEnd: 353.922760,
      endSong: "lamour",
      endSongStart: 59.626980,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "language",
      startSongEnd: 328.101379,
      endSong: "reach for me",
      endSongStart: 124.436142,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "everafter",
      startSongEnd: 265.026215,
      endSong: "miami",
      endSongStart: 113.713356,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "language",
      startSongEnd: 318.478607,
      endSong: "everafter",
      endSongStart: 49.072037,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "everafter",
      startSongEnd: 272.479156,
      endSong: "babylon",
      endSongStart: 71.089394,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "ultraviolet",
      startSongEnd: 315.227356,
      endSong: "everafter",
      endSongStart: 66.223885,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "ultraviolet",
      startSongEnd: 331.923798,
      endSong: "skylarking",
      endSongStart: 366.263641,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "quasar",
      startSongEnd: 196.249542,
      endSong: "lamour",
      endSongStart: 41.658463,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "without you",
      startSongEnd: 158.246216,
      endSong: "lamour",
      endSongStart: 42.087124,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "lamour",
      startSongEnd: 234.897583,
      endSong: "miami",
      endSongStart: 80.305382,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "lamour",
      startSongEnd: 238.838669,
      endSong: "torrent",
      endSongStart: 69.051605,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "torrent",
      startSongEnd: 142.898361,
      endSong: "every teardrop",
      endSongStart: 11.174557,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "every teardrop",
      startSongEnd: 222.706573,
      endSong: "language",
      endSongStart: 196.782166,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "every teardrop",
      startSongEnd: 333.936188,
      endSong: "torrent",
      endSongStart: 64.156013,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "apollo",
      startSongEnd: 265.420898,
      endSong: "every teardrop",
      endSongStart: 74.284897,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "easy",
      startSongEnd: 357.774994,
      endSong: "quasar",
      endSongStart: 63.398247,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "easy",
      startSongEnd: 355.803040,
      endSong: "baker street",
      endSongStart: 64.683037,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "miami",
      startSongEnd: 223.972519,
      endSong: "baker street",
      endSongStart: 128.925186,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "baker street",
      startSongEnd: 293.230835,
      endSong: "babylon",
      endSongStart: 66.717758,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "baker street",
      startSongEnd: 292.745270,
      endSong: "miami",
      endSongStart: 78.651230,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "babylon",
      startSongEnd: 234.398346,
      endSong: "quasar",
      endSongStart: 53.055809,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "quasar",
      startSongEnd: 197.797333,
      endSong: "skylarking",
      endSongStart: 207.232025,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "quasar",
      startSongEnd: 190.835098,
      endSong: "torrent",
      endSongStart: 166.534515,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "quasar",
      startSongEnd: 340.086792,
      endSong: "baker street",
      endSongStart: 64.889488,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "torrent",
      startSongEnd: 277.748840,
      endSong: "lamour",
      endSongStart: 35.708584,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "quasar",
      startSongEnd: 339.779938,
      endSong: "koala",
      endSongStart: 63.960140,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "easy",
      startSongEnd: 175.871902,
      endSong: "koala",
      endSongStart: 228.093292,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "koala",
      startSongEnd: 171.136215,
      endSong: "till tonight",
      endSongStart: 51.011158,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "till tonight",
      startSongEnd: 211.654068,
      endSong: "baker street",
      endSongStart: 63.335033,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "till tonight",
      startSongEnd: 112.070610,
      endSong: "miami",
      endSongStart: 80.823990,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "without you",
      startSongEnd: 276.263092,
      endSong: "till tonight",
      endSongStart: 38.603760,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "quasar",
      startSongEnd: 195.384933,
      endSong: "lightspeed",
      endSongStart: 6.788352,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "koala",
      startSongEnd: 309.461517,
      endSong: "lightspeed",
      endSongStart: 36.182682,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "lightspeed",
      startSongEnd: 174.878281,
      endSong: "torrent",
      endSongStart: 66.282288,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "lightspeed",
      startSongEnd: 173.392654,
      endSong: "cal state anthem",
      endSongStart: 49.116543,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "cal state anthem",
      startSongEnd: 251.290787,
      endSong: "animal rights",
      endSongStart: 80.356789,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "cal state anthem",
      startSongEnd: 159.571121,
      endSong: "lightspeed",
      endSongStart: 12.004528,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "years",
      startSongEnd: 202.542404,
      endSong: "cal state anthem",
      endSongStart: 47.239288,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "cal state anthem",
      startSongEnd: 160.770905,
      endSong: "quasar",
      endSongStart: 212.906494,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "animal rights",
      startSongEnd: 268.768951,
      endSong: "ill be ok",
      endSongStart: 130.884521,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "ill be ok",
      startSongEnd: 349.016205,
      endSong: "lightspeed",
      endSongStart: 35.852310,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "animal rights",
      startSongEnd: 268.606445,
      endSong: "till tonight",
      endSongStart: 63.212818,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "animal rights",
      startSongEnd: 297.347626,
      endSong: "quasar",
      endSongStart: 62.352673,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "easy",
      startSongEnd: 359.329315,
      endSong: "animal rights",
      endSongStart: 63.426117,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "without you",
      startSongEnd: 162.727097,
      endSong: "one more time",
      endSongStart: 7.186939,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "one more time",
      startSongEnd: 136.920074,
      endSong: "baker street",
      endSongStart: 75.443390,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "skylarking",
      startSongEnd: 242.751053,
      endSong: "one more time",
      endSongStart: 13.798616,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "years",
      startSongEnd: 201.731400,
      endSong: "one more time",
      endSongStart: 58.026669,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "one more time",
      startSongEnd: 141.210754,
      endSong: "jaded",
      endSongStart: 276.148254,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "jaded",
      startSongEnd: 453.885284,
      endSong: "the sky",
      endSongStart: 107.451714,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "the sky",
      startSongEnd: 442.278534,
      endSong: "lightspeed",
      endSongStart: 63.172398,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "the sky",
      startSongEnd: 152.850098,
      endSong: "easy",
      endSongStart: 46.121857,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

    {
      startSong: "easy",
      startSongEnd: 360.146362,
      endSong: "the sky",
      endSongStart: 72.216476,
      fileType: "mp3",
      transitionType: "active",
      type: "transition"
    },

      ];

    transitions.forEach(function (transition) {
      transition['playCount'] = 0;
      Transitions.insert(transition);
    });
  }

  if (Songs.find().count() === 0) {

    // accumulate songs from transitions
    Transitions.find().fetch().forEach(function (transition) {
      songs[transition.startSong] || (songs[transition.startSong] = {
        name: transition.startSong,
        fileType: "mp3",
        type: "song"
      });
      songs[transition.endSong] || (songs[transition.endSong] = {
        name: transition.endSong,
        fileType: "mp3",
        type: "song"
      });
    });

    // insert songs with sizes
    for (var songName in songs) {
      var song = songs[songName];
      song['playCount'] = 0;
      Songs.insert(song);
    }

    // link songs ids back to transitions
    Songs.find().fetch().forEach(function (song) {
      Transitions.update(
        { startSong: song.name },
        { $set: { startSong: song._id } },
        { multi: true });
      Transitions.update(
        { endSong: song.name },
        { $set: { endSong: song._id } },
        { multi: true });
    });

    console.log("Transition Count: "+Transitions.find().count());
    console.log("Song Count: "+Songs.find().count());
  }

});
