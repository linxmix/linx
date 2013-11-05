Storage = {

  //
  // vars
  //
  'local': false,
  'part': 'http://s3-us-west-2.amazonaws.com/linx-music/',

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
      '_id': (new Meteor.Collection.ObjectID()).toHexString(),
      'type': 'transition',
      'fileType': 'mp3',
      'playCount': 0,
      'volume': 1.0,
      'transitionType': 'active',
      'startSongVolume': 0.8,
      'endSongVolume': 0.8,
      'endSongStart': 0,
      /* dj startSong endSong startSongEnd endSongStart md5 duration */
    }, options);
  },

  'makeSong': function (options) {
    return $.extend({
      '_id': (new Meteor.Collection.ObjectID()).toHexString(),
      'type': 'song',
      'fileType': 'mp3',
      'playCount': 0,
      /* name title artist bitrate sampleRate echoId md5 duration */
    }, options);
  },

  'updateSample': function (sample) {
    if (!sample) { return; }
    // first determine this sample's corresponding collection
    var coll;
    switch (sample['type']) {
      case 'song': coll = Songs; break;
      case 'transition': coll = Transitions; break;
      default: return console.log("WARNING: sample of unknown type given to Storage.updateSample");
    }
    // then strip sample of _id and update that collection
    var clone = $.extend(true, {}, sample);
    delete clone._id;    
    coll.update({ '_id': sample['_id'] }, { $set: clone });
  },

  'calcMD5': function (arrayBuffer) {
    var spark = new SparkMD5.ArrayBuffer();
    spark.append(arrayBuffer);
    return spark.end();
  },

  'getAudioInfo': function (sample, callback) {
    // if sample has duration and md5, skip it
    if (sample['duration'] && sample['md5']) {
      return callback(sample);
    } else {
      var wave = Object.create(WaveSurfer);
      // hack to access the ArrayBuffer of audio data as it's read
      wave.loadBuffer = function (data) {
        var my = wave;
        wave.arrayBuffer = data;
        wave.pause();
        wave.backend.loadBuffer(data, function () {
          my.clearMarks();
          my.drawBuffer();
          my.fireEvent('ready');
        }, function () {
          my.fireEvent('error', 'Error decoding audio');
        });
      };
      // /hack
      wave.init({
        'container': $('#hiddenWaves')[0],
        'audioContext': audioContext
      });
      wave.on('ready', function () {
        $.extend(sample, {
          'md5': Storage.calcMD5(wave.arrayBuffer),
          'duration': Wave.getDuration(wave),
        });
        if (callback) { return callback(sample) };
      });
      wave.load(Storage.getSampleUrl(sample));
    }
  },

  // given a sample with md5 info, calls callback with metadata for it or undefined.
  // metadata will include _id if db already had this sample.
  'identifySample': function (options) {
    // curry args
    var sample = options.sample,
        callback = options.callback,
        checkDB = options.checkDB;
    if (typeof callback !== 'function') {
      return console.log("WARNING: improper callback given to Storage.identifySample!");
    }

    // if no md5, attempt to get it then try again
    if (!sample.md5) {
      Storage.getAudioInfo(sample, function (sample) {
        Storage.identifySample({ 'sample': sample, 'callback': callback });
      });
      return;
    }

    // first check to see if we have this md5 in our database
    if (checkDB) {
      var sampleMatch;
      if (sample['type'] === 'song') {
        sampleMatch = Songs.findOne({ 'md5': sample['md5'] });
      } else if (sample['type'] === 'transition') {
        sampleMatch = Transitions.findOne({ 'md5': sample['md5'] });
      }
      // if we found a matching sample, we're done.
      if (sampleMatch) {
        return callback(sampleMatch);
      }
    }

    // otherwise, if sample is a song, try echo nest
    if (sample['type'] === 'song') { Storage.echoID(sample, callback); }
    
    // if sample is not a song, finish now
    else { callback(); }
  },

  'echoID': function (sample, callback) {
    Meteor.call('echoID', { 'md5': sample['md5'] }, function(err, response) {
      if (err) { return console.log(err); }
      var track = (response && response.track);
      console.log(track);

      // if track info is present, update sample with that info and return
      if (track) {
        $.extend(sample, {
          'name': track.title,
          'title': track.title,
          'artist': track.artist,
          'bitrate': track.bitrate,
          'sampleRate': track.samplerate,
          'echoId': track.song_id,
          'md5': track.md5,
        });
        if (callback) { return callback(sample); }
      }

      // if no track info present, return undefined to callback
      else if (callback) { return callback(); }
    });
  },

  'saveMix': function (queue) {
    // extract all ids from samples in queue
    queue.map(function(sample) {
      return sample._id;
    });
    // TODO: call queue info modal here
    Mixes.insert({
      'name': name,
      'queue': queue,
    })
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

  'putSong': function(songWave, callback) {
    // if song is new, add to database and upload songWave
    var song = songWave.sample;
    if (!song._id) {
      // upload song to s3 server
      putWave(songWave, function () {
        song = songWave.sample = Storage.makeSong(song);
        Songs.insert(song);
        if (callback) { callback(); }
      });
    }
    // otherwise, just call callback
    else if (callback) { callback(); }
  },

  'putTransition': function(startWave, transitionWave, endWave, callback) {

    // add metadata to transitionwave's sample
    $.extend(transitionWave.sample, {
      'startSong': startWave.sample._id,
      'endSong': endWave.sample._id,
      'startSongEnd': startWave.markers['end'].position,
      'endSongStart': endWave.markers['start'].position,
      'startTime': transitionWave.markers['start'].position,
      'endTime': transitionWave.markers['end'].position,
    });

    // add transition metadata stuff to callback
    var newCallback = function (transition) {
      // update transition with timings and volume
      console.log("updating transition: ");
      console.log(transition);
      Storage.updateSample(transition);
      // call old callback
      if (callback) { callback(); }
    };

    // add transition to database and s3 server if doesnt already exist
    var transition = transitionWave.sample;
    if (!transition._id) {      
      // upload transition to s3 server
      putWave(transitionWave, function () {
        transition = transitionWave.sample = Storage.makeTransition(transition);
        Transitions.insert(transition);
        newCallback(transition);
      });
    // make sure to still call callback if not putting to server
    } else {
      newCallback(transition);
    }
  },

  'getSampleUrl': function(sample, local) {
    var part = Storage.part, ret;
    if (local || Storage.local || sample.local) part = "";
    if (sample.type === 'song') {
      ret = getSongUrl(sample, part);
    }
    else if (sample.type === 'transition') {
      ret = getTransitionUrl(sample, part);
    } else {
      throw new TypeError("ERROR: unknown sample type given to getSampleUrl");
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
      return console.log("ERROR: unknown sample type given to getOldSampleUrl");
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
    var rand = ~~(Math.random() * count);
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
  var middle = (Storage.local || song.local) ? song.name : song._id;
  if (!middle) {
    console.log("ERROR: getSongUrl has no middle!");
  }
  return part + 'songs/' + middle + '.' + song.fileType;
}

function getTransitionUrl(transition, part) {
  var middle = (Storage.local || transition.local) ?
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

  // TODO: fix this sorely misplaced logic!
  sample['_id'] = sample['md5'];
  sample['fileType'] = 'mp3'

  var url = Storage.getSampleUrl(sample, true);
  console.log("uploading wave to url: "+url);
  console.log(wave);
  Meteor.call('putArray', new Uint8Array(wave.arrayBuffer), url, callback);
}