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
  bucket: 'beatfn.com'
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

  putArray: function (array, url) {
    // access control
    if (!Meteor.userId()) {
      return console.log("ERROR: will not put to s3 if user is not logged in");
    }
    var headers = {
      'Content-Type': 'audio/mp3',
      'x-amz-acl': 'public-read'
    };
    var buffer = new Buffer(array);
    var ret = s3Client.putBuffer(buffer, url, headers, function(err, res) {
      if (err) { return console.log(err); }
      /*res.on('progress', function (e) {
        console.log("PROGRESS");
        console.log(e);
      });
      res.on('response', function(e) {
        console.log("RESPONSE");
        console.log(e);
      });*/
      res.resume();
    });
  }
});
