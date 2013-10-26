Storage = {

  //
  // vars
  //
  'local': false,
  'part': 'http://s3-us-west-2.amazonaws.com/linx-music/',
  'uploadsInProgress': 0,

  //
  // functions
  // 

  // creates a soft transition object from startSong to endSong
  'makeSoftTransition': function(startSong, endSong) {
    return Storage.makeTransition({
      'startSong': startSong,
      'endSong': endSong,
      'transitionType': 'soft',
      '_id': 'soft',
    });
  },

  'makeTransition': function (options) {
    return $.extend({
      // knowns
      '_id': (new Meteor.Collection.ObjectID()).toHexString(),
      'type': 'transition',
      'fileType': 'mp3',
      'playCount': 0,
      'volume': 1.0,
      'transitionType': 'active',
      // unknowns
      'dj': '',
      'startSong': '',
      'startSongVolume': 0.8,
      'startSongEnd': 0,
      'endSong': '',
      'endSongVolume': 0.8,
      'endSongStart': 0,
    }, options);
  },

  'makeSong': function (options) {
    return $.extend({
      // knowns
      '_id': (new Meteor.Collection.ObjectID()).toHexString(),
      'type': 'song',
      'fileType': 'mp3',
      'playCount': 0,
      // unknowns
      'title': '',
      'artist': '',
      'bitrate': 0,
      'sampleRate': 0,
      'echoId': '',
      'md5': '',
    }, options);
  },

  'updateAll': function(coll, fnc) {
    // check user is logged in
    if (!Meteor.userId()) {
      return alert("Sorry, but you must be logged in to updateAll!");
    }

    // if fnc is an object, set it directly
    if (typeof fnc === 'object') {
      coll.find().fetch().forEach(function (element) {
        coll.update({ '_id': element._id }, { $set: fnc });
      });

    // if fnc is a function, call it on each element
    } else if (typeof fnc === 'function') {
      coll.find().fetch().forEach(fnc);
    }
  },

  'deleteSample': function(sample) {
    // check user is logged in
    if (!Meteor.userId()) {
      return alert("Sorry, but you must be logged in to delete!");
    }
    // first delete from database
    if (sample.type === 'transition') {
      Transitions.remove({ '_id': sample._id });

    } else if (sample.type === 'song') {
      // raise flag if this song has any remaining links
      var links = Transitions.find({
        $or: [ { 'startSong': sample._id }, { 'endSong': sample._id } ]
      }).fetch();
      if (links.length > 0) {
        console.log("WARNING: tried to remove song with trailing links.");
        return console.log(links);
      }
      Songs.remove({ '_id': sample._id });

    } else {
      return console.log("WARNING: sample of unknown type given to Storage.deleteSample");
    }
    // then delete from s3 server
    var url = Storage.getSampleUrl(sample, true);
    Storage.deleteFile(url);
  },

  'deleteFile': function(url, callback) {
    Meteor.call('deleteFile', url, callback);
  },

  'copyFile': function(src, dest, callback) {
    Meteor.call('copyFile', src, dest, callback);
  },

  'putSong': function(wave, callback) {

    var newCallback = function () {
      // call old callback
      if (callback) { callback(); }
    };

    var song = wave.sample;
    // if song is new, add to database and upload wave
    if (!Songs.findOne(song._id)) {
      // upload song to s3 server
      putWave(wave, function () {
        song._id = Songs.insert(song);
        newCallback();
      });
    }
    // otherwise, just call callback
    else {
      newCallback();
    }
  },

  'putTransition': function(startWave, transitionWave, endWave, callback) {
    var startSongEnd = startWave.markers['end'].position;
    var endSongStart = endWave.markers['start'].position;

    var startTime = transitionWave.markers['start'].position;
    var endTime = transitionWave.markers['end'].position;

    var startSong = Songs.findOne({ 'name': startWave.sample.name });
    var endSong = Songs.findOne({ 'name': endWave.sample.name });

    // get transition metadata, or make if wave doesn't have it
    var transition = transitionWave.sample =
      transitionWave.sample || Storage.makeTransition({
        'startSong': startSong._id,
        'endSong': endSong._id,
        'dj': transitionWave.dj,
        'duration': Wave.getDuration(transitionWave),
    });

    // add transition metadata stuff to callback
    var newCallback = function () {
      // update transition with timings and volume
      Transitions.update({ '_id': transition._id }, { $set:
        {
          'startSongEnd': startSongEnd,
          'endSongStart': endSongStart,
          'startTime': startTime,
          'endTime': endTime,
          'startSongVolume': $('#startWave .volumeSlider').data('slider').getValue(),
          'endSongVolume': $('#endWave .volumeSlider').data('slider').getValue(),
          'volume': $('#transitionWave .volumeSlider').data('slider').getValue()
        }
      });
      // call old callback
      if (callback) { callback(); }
    };

    // add transition to database and s3 server if doesnt already exist
    if (!Transitions.findOne(transition._id)) {
      // upload transition to s3 server
      putWave(transitionWave, function () {
        transition._id = Transitions.insert(transition);
        newCallback();
      });
    // make sure to still call callback if not putting to server
    } else {
      newCallback();
    }
  },

  'getSampleUrl': function(sample, local) {
    var part = Storage.part, ret;
    if (local || Storage.local) part = "";
    if (sample.type === 'song') {
      ret = getSongUrl(sample, part);
    }
    else if (sample.type === 'transition') {
      ret = getTransitionUrl(sample, part);
    } else {
      return console.log("ERROR: unknown sample type given to getSampleUrl");
    }
    // replace whitespace with underscore so s3 accepts it
    ret = (ret && ret.replace(/\s/g, '_'));
    console.log("getSampleUrl returning: "+ret);
    return ret;
  },

  'getOldSampleUrl': function(sample, local) {
    var part = Storage.part, ret;
    if (local || Storage.local) part = "";
    if (sample.type === 'song') {
      ret = getOldSongUrl(sample, part);
    }
    else if (sample.type === 'transition') {
      ret = getOldTransitionUrl(sample, part);
    } else {
      return console.log("ERROR: unknown sample type given to getSampleUrl");
    }
    // replace whitespace with underscore so s3 accepts it
    ret = (ret && ret.replace(/\s/g, '_'));
    console.log("getOldSampleUrl returning: "+ret);
    return ret;
  },
  
  // get a random entry from given collection
  // TODO: make this true random and not need to get every doc
  'getRandom': function(coll) {
    var found = coll.find();
    var count = found.count() - 1; // -1 for array indexing
    var rand = Math.round(Math.random() * count);
    return found.fetch()[rand];
  },

  // increment given sample's playcount in the database
  'incrementPlayCount': function (sample) {
    // curry appropriate collection
    var coll;
    if (sample.type === 'song') { coll = Songs; }
    else if (sample.type === 'transition') { coll = Transitions; }
    else { return console.log("WARNING: tried to incrementPlayCount of unknown sample type"); }
    // update coll
    coll.update({ '_id': sample._id }, { $inc: { 'playCount': 1 } });
  },

  // print all sample urls not present on s3 server
  'checkExistingSamples': function(coll, prefix) {
    var samples = coll.find().fetch();
    Meteor.call('getList', prefix, function(err, data) {
      if (err) { return console.log(err); }
      var urlList = data.Contents.map(function (listItem) {
        return listItem.Key;
      });

      // function to check to see if value exists in array
      function isInArray(value, array) {
        return array.indexOf(value) > -1 ? true : false;
      }

      // remove from results samples that are not on server
      samples.filter(function (sample) {
        var url = Storage.getSampleUrl(sample, true);
        var bool = isInArray(url, urlList);
        if (!bool) {
          console.log("s3 is missing sample: "+url);
        }
        return bool;
      });
    });
  },

};

//
// private methods
//
function getSongUrl(song, part) {
  var middle = Storage.local ? song.name : song._id;
  if (!middle) {
    console.log("ERROR: getSongUrl has no middle!");
  }
  return part + 'songs/' + middle + '.' + song.fileType;
}

function getTransitionUrl(transition, part) {
  var middle = Storage.local ?
    Songs.findOne(transition.startSong).name + '-' +
    Songs.findOne(transition.endSong).name : transition._id;
  if (!middle) {
    console.log("ERROR: getTransitionUrl has no middle!");
  }
  return part + 'transitions/' + middle + '.' + transition.fileType;
}

function getOldSongUrl(song, part) {
  var middle = song.name;
  if (!middle) {
    console.log("ERROR: getSongUrl has no middle!");
  }
  return part + 'songs/' + middle + '.' + song.fileType;
}


function getOldTransitionUrl(transition, part) {
  var middle = Songs.findOne(transition.startSong).name + '-' +
    Songs.findOne(transition.endSong).name;
  if (!middle) {
    console.log("ERROR: getTransitionUrl has no middle!");
  }
  return part + 'transitions/' + middle + '.' + transition.fileType;
}

// uploads buffer of given wave to s3
function putWave(wave, callback) {
  var sample = wave.sample;
  var url = Storage.getSampleUrl(sample, true);
  console.log("uploading wave to url: "+url);
  console.log(wave);
  Meteor.call('putArray', new Uint8Array(wave.arrayBuffer), url, callback);
}