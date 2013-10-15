//
// s3 stuff
//
var s3Client = Knox.createClient({
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

  putArray: function (array, url) {
    // access control
    if (!Meteor.userId()) {
      return console.log("ERROR: will not put to s3 if user is not logged in");
    }
    var headers = {
      'Content-Type': 'audio/mp3'
    };
    var buffer = new Buffer(array);
    s3Client.putBuffer(buffer, url, headers, function(err, res) {
      if (err) { return console.log(err); }
      res.resume();
    });
  }
});
