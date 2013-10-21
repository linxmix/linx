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

  'getFileUrl': exceptionWrapper(function (path) {
    var local = true;
    if (local) {
      console.log("Serving File Locally: "+path);
      return path;
    } else {
      console.log("Getting File Externally: "+path);
      return s3Client.http(path);
    }
  }),

  // TODO: will max-keys be an issue? check knox list api for reference
  'getList': exceptionWrapper(function(prefix) {
    var fut = new Future();
    s3Client.list({ 'prefix': prefix}, function (err, data) {
      if (err) { return err; }
      fut['return'](data);
    });
    return fut.wait();
  }),

  'putArray': exceptionWrapper(function (array, url) {
    putArray(array, url, 0);
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
    }
  };
}

// put given array to the s3 server at given url
function putArray(array, url, attempt) {

  // set headers
  var headers = {
    'Content-Type': 'audio/mp3',
    'x-amz-acl': 'public-read',
    'x-amz-storage-class': 'REDUCED_REDUNDANCY'
  };

  // make buffer and http request
  var buffer = new Buffer(array);
  console.log("PUTTING TO URL: "+url);

  // error handler
  function handleError(error) {
    // reattempt on error if less than 3 attempts
    if (attempt < 3) {
      console.log(error);
      putArray(array, url, ++attempt);
    } else {
      console.log("ERROR: failed putArray 3 times for url: "+url+"; giving up on PUT");
      throw error;
    }
  }

  // put buffer
  var ret = s3Client.putBuffer(buffer, url, headers,
    Meteor.bindEnvironment(function(err, res) {

    if (err) { console.log(err); }
    // handle errors
    ret.on('error',
      Meteor.bindEnvironment(
        function (error) { handleError(error); },
        function () { console.log('Failed to bind environment'); }
      )
    );

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