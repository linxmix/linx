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
  bucket: 'linx-music',
});

Meteor.methods({

  // TODO: will max-keys be an issue? check knox list api for reference
  'getList': function(prefix) {
    if (!Meteor.userId()) {
      return console.log("WARNING: Server method called from user who was not logged in!");
    }
    var fut = new Future();
    s3Client.list({ 'prefix': prefix}, function (err, data) {
      if (err) { fut['return'](err); }
      fut['return'](data);
    });
    return fut.wait();
  },

  'deleteFile': function(url) {
    if (!Meteor.userId()) {
      return console.log("WARNING: Server method called from user who was not logged in!");
    }
    console.log("DELETING FILE: "+url);
    s3Client.deleteFile(url, function(err, res) {
      if (err) { return console.log(err); }
      res.resume();
    });
  },

  'copyFile': function (oldUrl, newUrl) {
    if (!Meteor.userId()) {
      return console.log("WARNING: Server method called from user who was not logged in!");
    }
    console.log("COPYING FILE AT: "+oldUrl+" TO NEW URL: "+newUrl);
    s3Client.copyFile(oldUrl, newUrl, function(err, res) {
      if (err) { return console.log(err); }
      res.resume();
    });
  },

  'putArray': function (array, url) {
    if (!Meteor.userId()) {
      return console.log("WARNING: Server method called from user who was not logged in!");
    }
    this.unblock();
    putArray(array, url, 0);
  },

});

// put given array to the s3 server at given url
function putArray(array, url, attempt) {
  var buffer = new Buffer(array);
  console.log("PUTTING TO URL: "+url);

  // set headers
  var headers = {
    'Content-Type': 'audio/mp3',
    'x-amz-acl': 'public-read',
  };

  // error handler
  var handling = false;
  function handleError(error) {
    if (!handling) {
      handling = true;
      // reattempt on error if less than 3 attempts
      if (attempt < 3) {
        console.log(error);
        putArray(array, url, ++attempt);
      } else {
        console.log("ERROR: failed putArray 3 times for url: "+url+"; giving up on PUT");
        handling = false;
      }
      handling = false;
    }
  }

  // put buffer
  var fut = new Future();
  var req = s3Client.putBuffer(buffer, url, headers, function(err, res) {

    // handle errors
    if (err) { handleError(err); }
    req.on('error', function (error) {
      handleError(error);
    });

    // call callback on finish
    res.on('end', function () {
      console.log("upload complete");
      fut['return']({ successFlag: true });
    });

    res.resume();
  });
  return fut.wait();
}


      //req.on('progress', function (e) {
      //  console.log("PROGRESS");
      //  console.log(e);
      //});
      //req.on('response', function(e) {
      //  console.log("RESPONSE");
      //  console.log(e);
      //});