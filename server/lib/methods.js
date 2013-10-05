//
// s3 stuff
//
var client = Knox.createClient({
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
      return client.http(path);
    }
  },
/*
  putStream: function (arrayBuffer, url) {
    // access control
    if (!Meteor.userId()) {
      return console.log("ERROR: will not put stream if user is not logged in");
    }
    var headers = {
      'Content-Type': 'audio/mpeg3'
    };
    console.log(arrayBuffer);
    console.log(url);
    var buffer = toBuffer(arrayBuffer);
    console.log(buffer);
    client.putBuffer(buffer, url, headers, function(err, res) {
      if (err) { return console.log(err); }
      res.resume();
    });
  }*/
});

//    var buffer = new Buffer( new Uint8Array(arrayBuffer));


function toBuffer(ab) {
  var buffer = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}