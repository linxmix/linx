Songs = new Meteor.Collection("Songs");
Transitions = new Meteor.Collection("Transitions");

//
// server
//
Meteor.startup(function () {


  //
  // amazon s3 stuff
  //
  /*
  var knoxInterval = Meteor.setInterval(function(){
    if (knox) {
      Meteor.clearInterval(knoxInterval);
      console.log("creating client!");
      client = knox.createClient({
        key: 'AKIAIYJQCD622ZS3OMLA',
        secret: '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',
        bucket: 'beatfn.com'
      });
      console.log(client);
      console.log("client created!");
    }
  }, 1000);

  Meteor.methods({
    'knox': function() {
      console.log(knox);
    }
  });
  */

  var client = Knox.createClient({
    region: 'us-west-2', // NOTE: this must be changed when the bucket goes US-Standard!
    key: 'AKIAIYJQCD622ZS3OMLA',
    secret: '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',
    bucket: 'beatfn.com'
  });
  console.log(client);
  client.list({}, function(err, data) {
    if (err) return console.log(err);
    console.log(data);
  });


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
      startTime: 192.353714,
      endSong: "i could be the one",
      endTime: 107.620399,
      type: "mp3"
    },

    {
      startSong: "i could be the one",
      startTime: 380.738556,
      endSong: "alive",
      endTime: 34.396709,
      type: "mp3"
    },

    {
      startSong: "alive",
      startTime: 250.603012,
      endSong: "torrent",
      endTime: 62.447994,
      type: "mp3"
    },

    {
      startSong: "torrent",
      startTime: 143.641342,
      endSong: "without you",
      endTime: 171.131622,
      type: "mp3"
    },

    {
      startSong: "torrent",
      startTime: 144.216965,
      endSong: "quasar",
      endTime: 209.397522,
      type: "mp3"
    },

    {
      startSong: "without you",
      startTime: 276.077362,
      endSong: "miami",
      endTime: 77.067917,
      type: "mp3"
    },

    {
      startSong: "without you",
      startTime: 279.443787,
      endSong: "baker street",
      endTime: 88.610138,
      type: "mp3"
    },

    {
      startSong: "miami",
      startTime: 143.402145,
      endSong: "ultraviolet",
      endTime: 220.827164,
      type: "mp3"
    },

    {
      startSong: "miami",
      startTime: 164.153366,
      endSong: "without you",
      endTime: 137.536957,
      type: "mp3"
    },

    {
      startSong: "ultraviolet",
      startTime: 333.104248,
      endSong: "babylon",
      endTime: 109.693863,
      type: "mp3"
    },

    {
      startSong: "babylon",
      startTime: 220.245621,
      endSong: "dont you worry child",
      endTime: 89.395668,
      type: "mp3"
    },

    {
      startSong: "dont you worry child",
      startTime: 198.945801,
      endSong: "alive",
      endTime: 144.281357,
      type: "mp3"
    },

    {
      startSong: "dont you worry child",
      startTime: 354.241913,
      endSong: "without you",
      endTime: 42.679478,
      type: "mp3"
    },

    {
      startSong: "dont you worry child",
      startTime: 351.336517,
      endSong: "years",
      endTime: 34.668739,
      type: "mp3"
    },

    {
      startSong: "everafter",
      startTime: 251.031448,
      endSong: "years",
      endTime: 47.861614,
      type: "mp3"
    },

    {
      startSong: "years",
      startTime: 208.427948,
      endSong: "easy",
      endTime: 35.244785,
      type: "mp3"
    },

    {
      startSong: "years",
      startTime: 203.284836,
      endSong: "dont you worry child",
      endTime: 63.690960,
      type: "mp3"
    },

    {
      startSong: "dont you worry child",
      startTime: 352.708984,
      endSong: "skylarking",
      endTime: 153.944778,
      type: "mp3"
    },

    {
      startSong: "i could be the one",
      startTime: 201.063812,
      endSong: "skylarking",
      endTime: 257.211761,
      type: "mp3"
    },

    {
      startSong: "skylarking",
      startTime: 529.551392,
      endSong: "ultraviolet",
      endTime: 126.058815,
      type: "mp3"
    },

    {
      startSong: "skylarking",
      startTime: 530.919739,
      endSong: "language",
      endTime: 65.866142,
      type: "mp3"
    },

    {
      startSong: "i could be the one",
      startTime: 199.788696,
      endSong: "language",
      endTime: 184.109070,
      type: "mp3"
    },

    {
      startSong: "kawaii",
      startTime: 222.738846,
      endSong: "language",
      endTime: 285.191101,
      type: "mp3"
    },

    {
      startSong: "reach for me",
      startTime: 190.265793,
      endSong: "kawaii",
      endTime: 113.981590,
      type: "mp3"
    },

    {
      startSong: "kawaii",
      startTime: 291.221283,
      endSong: "reach for me",
      endTime: 60.380409,
      type: "mp3"
    },

    {
      startSong: "i could be the one",
      startTime: 199.254166,
      endSong: "apollo",
      endTime: 164.703293,
      type: "mp3"
    },

    {
      startSong: "alive",
      startTime: 132.584869,
      endSong: "apollo",
      endTime: 36.821423,
      type: "mp3"
    },

    {
      startSong: "apollo",
      startTime: 275.805481,
      endSong: "alive",
      endTime: 32.706635,
      type: "mp3"
    },

/*  TODO: can't currently have a multi-edge. need to fix this!
    {
      startSong: "apollo",
      startTime: 152.975479,
      endSong: "alive",
      endTime: 142.088867,
      type: "mp3"
    },
*/
/*
    {
      startSong: "language",
      startTime: 318.223175,
      endSong: "apollo",
      endTime: 146.066269,
      type: "mp3"
    },
    */

    {
      startSong: "kawaii",
      startTime: 353.922760,
      endSong: "lamour",
      endTime: 59.626980,
      type: "mp3"
    },

    {
      startSong: "language",
      startTime: 328.101379,
      endSong: "reach for me",
      endTime: 124.436142,
      type: "mp3"
    },

    {
      startSong: "everafter",
      startTime: 265.026215,
      endSong: "miami",
      endTime: 113.713356,
      type: "mp3"
    },

    {
      startSong: "language",
      startTime: 318.478607,
      endSong: "everafter",
      endTime: 49.072037,
      type: "mp3"
    },

    {
      startSong: "everafter",
      startTime: 272.479156,
      endSong: "babylon",
      endTime: 71.089394,
      type: "mp3"
    },

    {
      startSong: "ultraviolet",
      startTime: 315.227356,
      endSong: "everafter",
      endTime: 66.223885,
      type: "mp3"
    },

    {
      startSong: "ultraviolet",
      startTime: 331.923798,
      endSong: "skylarking",
      endTime: 366.263641,
      type: "mp3"
    },

    {
      startSong: "quasar",
      startTime: 196.249542,
      endSong: "lamour",
      endTime: 41.658463,
      type: "mp3"
    },

    {
      startSong: "without you",
      startTime: 158.246216,
      endSong: "lamour",
      endTime: 42.087124,
      type: "mp3"
    },

    {
      startSong: "lamour",
      startTime: 234.897583,
      endSong: "miami",
      endTime: 80.305382,
      type: "mp3"
    },

    {
      startSong: "lamour",
      startTime: 238.838669,
      endSong: "torrent",
      endTime: 69.051605,
      type: "mp3"
    },

    {
      startSong: "torrent",
      startTime: 142.898361,
      endSong: "every teardrop",
      endTime: 11.174557,
      type: "mp3"
    },

    {
      startSong: "every teardrop",
      startTime: 222.706573,
      endSong: "language",
      endTime: 196.782166,
      type: "mp3"
    },

    {
      startSong: "every teardrop",
      startTime: 333.936188,
      endSong: "torrent",
      endTime: 64.156013,
      type: "mp3"
    },

    {
      startSong: "apollo",
      startTime: 265.420898,
      endSong: "every teardrop",
      endTime: 74.284897,
      type: "mp3"
    },

    {
      startSong: "easy",
      startTime: 357.774994,
      endSong: "quasar",
      endTime: 63.398247,
      type: "mp3"
    },

    {
      startSong: "easy",
      startTime: 355.803040,
      endSong: "baker street",
      endTime: 64.683037,
      type: "mp3"
    },

    {
      startSong: "miami",
      startTime: 223.972519,
      endSong: "baker street",
      endTime: 128.925186,
      type: "mp3"
    },

    {
      startSong: "baker street",
      startTime: 293.230835,
      endSong: "babylon",
      endTime: 66.717758,
      type: "mp3"
    },

    {
      startSong: "baker street",
      startTime: 292.745270,
      endSong: "miami",
      endTime: 78.651230,
      type: "mp3"
    },

    {
      startSong: "babylon",
      startTime: 234.398346,
      endSong: "quasar",
      endTime: 53.055809,
      type: "mp3"
    },

    {
      startSong: "quasar",
      startTime: 197.797333,
      endSong: "skylarking",
      endTime: 207.232025,
      type: "mp3"
    },

    {
      startSong: "quasar",
      startTime: 190.835098,
      endSong: "torrent",
      endTime: 166.534515,
      type: "mp3"
    },

    {
      startSong: "quasar",
      startTime: 340.086792,
      endSong: "baker street",
      endTime: 64.889488,
      type: "mp3"
    },

    {
      startSong: "torrent",
      startTime: 277.748840,
      endSong: "lamour",
      endTime: 35.708584,
      type: "mp3"
    },

    {
      startSong: "quasar",
      startTime: 339.779938,
      endSong: "koala",
      endTime: 63.960140,
      type: "mp3"
    },

    {
      startSong: "easy",
      startTime: 175.871902,
      endSong: "koala",
      endTime: 228.093292,
      type: "mp3"
    },

    {
      startSong: "koala",
      startTime: 171.136215,
      endSong: "till tonight",
      endTime: 51.011158,
      type: "mp3"
    },

    {
      startSong: "till tonight",
      startTime: 211.654068,
      endSong: "baker street",
      endTime: 63.335033,
      type: "mp3"
    },

    {
      startSong: "till tonight",
      startTime: 112.070610,
      endSong: "miami",
      endTime: 80.823990,
      type: "mp3"
    },

    {
      startSong: "without you",
      startTime: 276.263092,
      endSong: "till tonight",
      endTime: 38.603760,
      type: "mp3"
    },

    {
      startSong: "quasar",
      startTime: 195.384933,
      endSong: "lightspeed",
      endTime: 6.788352,
      type: "mp3"
    },

    {
      startSong: "koala",
      startTime: 309.461517,
      endSong: "lightspeed",
      endTime: 36.182682,
      type: "mp3"
    },

    {
      startSong: "lightspeed",
      startTime: 174.878281,
      endSong: "torrent",
      endTime: 66.282288,
      type: "mp3"
    },

    {
      startSong: "lightspeed",
      startTime: 173.392654,
      endSong: "cal state anthem",
      endTime: 49.116543,
      type: "mp3"
    },

    {
      startSong: "cal state anthem",
      startTime: 251.290787,
      endSong: "animal rights",
      endTime: 80.356789,
      type: "mp3"
    },

    {
      startSong: "cal state anthem",
      startTime: 159.571121,
      endSong: "lightspeed",
      endTime: 12.004528,
      type: "mp3"
    },

    {
      startSong: "years",
      startTime: 202.542404,
      endSong: "cal state anthem",
      endTime: 47.239288,
      type: "mp3"
    },

    {
      startSong: "cal state anthem",
      startTime: 160.770905,
      endSong: "quasar",
      endTime: 212.906494,
      type: "mp3"
    },

    {
      startSong: "animal rights",
      startTime: 268.768951,
      endSong: "ill be ok",
      endTime: 130.884521,
      type: "mp3"
    },

    {
      startSong: "ill be ok",
      startTime: 349.016205,
      endSong: "lightspeed",
      endTime: 35.852310,
      type: "mp3"
    },

    {
      startSong: "animal rights",
      startTime: 268.606445,
      endSong: "till tonight",
      endTime: 63.212818,
      type: "mp3"
    },

    {
      startSong: "animal rights",
      startTime: 297.347626,
      endSong: "quasar",
      endTime: 62.352673,
      type: "mp3"
    },

    {
      startSong: "easy",
      startTime: 359.329315,
      endSong: "animal rights",
      endTime: 63.426117,
      type: "mp3"
    },

    {
      startSong: "without you",
      startTime: 162.727097,
      endSong: "one more time",
      endTime: 7.186939,
      type: "mp3"
    },

    {
      startSong: "one more time",
      startTime: 136.920074,
      endSong: "baker street",
      endTime: 75.443390,
      type: "mp3"
    },

    {
      startSong: "skylarking",
      startTime: 242.751053,
      endSong: "one more time",
      endTime: 13.798616,
      type: "mp3"
    },

    {
      startSong: "years",
      startTime: 201.731400,
      endSong: "one more time",
      endTime: 58.026669,
      type: "mp3"
    },

    {
      startSong: "one more time",
      startTime: 141.210754,
      endSong: "jaded",
      endTime: 276.148254,
      type: "mp3"
    },

    {
      startSong: "skylarking",
      startTime: 396.657471,
      endSong: "jaded",
      endTime: 126.761658,
      type: "mp3"
    },

    {
      startSong: "jaded",
      startTime: 453.885284,
      endSong: "the sky",
      endTime: 107.451714,
      type: "mp3"
    },

    {
      startSong: "the sky",
      startTime: 442.278534,
      endSong: "lightspeed",
      endTime: 63.172398,
      type: "mp3"
    },

    {
      startSong: "the sky",
      startTime: 152.850098,
      endSong: "easy",
      endTime: 46.121857,
      type: "mp3"
    },

    {
      startSong: "easy",
      startTime: 360.146362,
      endSong: "the sky",
      endTime: 72.216476,
      type: "mp3"
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
      songs[transition.startSong] || (songs[transition.startSong] = { name: transition.startSong, type: "mp3" });
      songs[transition.endSong] || (songs[transition.endSong] = { name: transition.endSong, type: "mp3" });
    });

    // insert songs
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
    /*
    songs = Songs.find().fetch();
    for (var i = 0; i < songs.length; i++) {
      var song = songs[i];
      Transitions.update({ startSong: song.name }, { $set: { startSong: song._id } });
      Transitions.update({ endSong: song.name }, { $set: { endSong: song._id } });
    }
    */
  console.log("Transition Count: "+Transitions.find().count());
  console.log("Song Count: "+Songs.find().count());
  }
});
