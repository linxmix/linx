Meteor.startup(function () {
 Path = Npm.require('path');
 fs = Npm.require('fs');
 var decoder = Npm.require('string_decoder').StringDecoder;
 StringDecoder = new decoder('utf8');
});

//
// echojs stuff
//
echoClient = Echojs({
  'key': 'CWBME38JDGQNEJPXT'
});

echoClient('song/search').get({
  artist: 'radiohead',
  title: 'karma police'
}, function (err, json) {
  console.log(json.response);
});

console.log(CryptoJS.MD5('some-string').toString());

Meteor.methods({

  'identifySong': exceptionWrapper(function (songId, path) {
    console.log("IDENTIFYING SONG:"+path);

    // first get the track from s3
    s3Client.getFile(path, Meteor.bindEnvironment(function(err, res) {
      if (err) { return console.log(err); }

      // collect Buffer chunks into array
      var buffers = [];
      res.on('data', function(chunk) {
        buffers.push(chunk);
      });

      // concat Buffers, compute md5, then pass to echo nest
      res.on('end', function() {
        // var bufferString = StringDecoder.write(Buffer.concat(buffers));
        fs.writeFileSync('tmp.mp3', Buffer.concat(buffers));
        var bufferString = fs.readFileSync('tmp.mp3', 'utf8');
        console.log(bufferString);
        var md5String = CryptoJS.MD5(bufferString).toString();
        console.log(md5String);

        echoClient('track/profile').get({
          'md5': md5String,
        }, function(err, json) {
          if (err) { return console.log(err); }

          // update database with track info
          var track = json.response.track;
          Songs.update({ '_id': songId }, { $set:
            {
              'title': track.title,
              'artist': track.artist,
              'bitrate': track.bitrate,
              'sampleRate': track.samplerate,
              'md5': track.md5,
            }
          });

          console.log(json.response);
        });
      });

      res.resume();
    }, function () { console.log('Failed to bind environment'); }));

  }),

});


// wrap function in try/catch so that server won't reset on error
function exceptionWrapper(func, extra) {
  return function() {
    try {
      return func.apply(this, arguments);
    } catch (e) {
      console.log("SERVER ERROR CAUGHT!");
      console.log(e);
      console.log(e.stack);
    }
  };
}
