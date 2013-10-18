Meteor.startup(function () {
 Future = Npm.require('fibers/future');
});

//
// s3 stuff
//
s3Client = Knox.createClient({
  region: 'us-west-2', // NOTE: this must be changed when the bucket goes US-Standard!
  key: 'AKIAIYJQCD622ZS3OMLA',
  secret: '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',
  bucket: 'linx-music'
});

//
// meteor methods
//
Meteor.methods({

  getFileUrl: function (path) {
    var local = true;
    if (local) {
      console.log("Serving File Locally: "+path);
      return path;
    } else {
      console.log("Getting File Externally: "+path);
      return s3Client.http(path);
    }
  },

  // TODO: will max-keys be an issue? check knox list api for reference
  getList: function(prefix) {
    var fut = new Future();
    s3Client.list({ 'prefix': prefix}, function (err, data) {
      if (err) { return err; }
      fut['return'](data);
    });
    return fut.wait();
  },

  'putArray': function (array, url) {
    putArray(array, url, 0);
  }

});

function putArray(array, url, attempt) {

  // give up after 3 attempts, and log that we failed
  if (attempt >= 3) {
    return console.log("ERROR: failed 3 times, giving up on PUT");
  }

  // access control
  if (!Meteor.userId()) {
    return console.log("ERROR: will not put to s3 if user is not logged in");
  }

  // set headers
  var headers = {
    'Content-Type': 'audio/mp3',
    'x-amz-acl': 'public-read',
    'x-amz-storage-class': 'REDUCED_REDUNDANCY'
  };

  // make buffer and http request
  var buffer = new Buffer(array);
  console.log("PUTTING TO URL: "+url);
  var ret = s3Client.putBuffer(buffer, url, headers,
    Meteor.bindEnvironment(function(err, res) {

    // on error, reattempt after 1 second
    if (err) { return console.log(err); }
    ret.on('error', Meteor.bindEnvironment(function(error) {
      console.log(error);
      Meteor.setTimeout(function() {
        putArray(array, url, attempt++);
      }, 1000);

    }, function () { console.log('Failed to bind environment'); }));
    res.resume();
  }, function () { console.log('Failed to bind environment'); }));
}


      //ret.on('progress', function (e) {
      //  console.log("PROGRESS");
      //  console.log(e);
      //});
      //ret.on('response', function(e) {
      //  console.log("RESPONSE");
      //  console.log(e);
      //});