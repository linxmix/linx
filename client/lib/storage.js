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
    Meteor.call('deleteFile', url);
  },

  'putSong': function(wave, callback) {
    var song = wave.sample;
    // if song is new, add to database and upload wave
    if (!song._id) {
      // upload song to s3 server
      putWave(wave, function () {
        song._id = Songs.insert(song);
        if (callback) { callback(); }
      });
    }
    // otherwise, just update song volume and call callback
    else {
      Songs.update(
        { '_id': song._id },
        { $set: { 'volume': song.volume } }
      );
      if (callback) { callback(); }
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
    var transition = transitionWave.sample = transitionWave.sample || {
      'type': 'transition',
      'transitionType': 'active',
      // TODO: make this based on given buffer's file name extension
      'fileType': 'mp3',
      'startSong': startSong._id,
      'endSong': endSong._id,
      'dj': transitionWave.dj
    };
    
    // add transition to database and s3 server if doesnt already exist
    if (!transition._id) {
      // upload transition to s3 server
      putWave(transitionWave, function () {
        transition._id = Transitions.insert(transition);
        if (callback) { callback(); }
      });
    // make sure to still call callback if not putting to server
    } else {
      if (callback) { callback(); }
    }

    // update transition with timings and volume
    Transitions.update({ '_id': transition._id }, { $set:
      {
        'startSongEnd': startSongEnd,
        'endSongStart': endSongStart,
        'startTime': startTime,
        'endTime': endTime,
        'volume': $('#transitionWave .volumeSlider').data('slider').getValue()
      }
    });
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
  
  // get a random entry from given collection
  // TODO: make this true random and not need to get every doc
  'getRandom': function(coll) {
    var found = coll.find();
    var count = found.count() - 1; // -1 for array indexing
    var rand = Math.round(Math.random() * count);
    return found.fetch()[rand];
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

      // remove samples that are not on server
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
  return part + 'songs/' + song.name + '.' + song.fileType;
}

function getTransitionUrl(transition, part) {
  return part + 'transitions/' +
    Songs.findOne(transition.startSong).name + '-' +
    Songs.findOne(transition.endSong).name + '.' + transition.fileType;
}

// uploads buffer of given wave to s3
function putWave(wave, callback) {
  var sample = wave.sample;
  var url = Storage.getSampleUrl(sample, true);
  console.log("uploading wave to url: "+url);
  console.log(wave);
  ++Storage.uploadsInProgress;
  Meteor.call('putArray', new Uint8Array(wave.arrayBuffer), url, callback);
}