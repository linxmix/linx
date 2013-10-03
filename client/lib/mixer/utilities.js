//
// utility functions
//
// TODO: finish this once i get song and transition durations
// TODO: write function to get calculated load time (based on song to load)
var bufferLoadSpeedSet = false;
updateBufferLoadSpeed = function(path, lagTime) {

  // average with current load time unless this is first set
  if (lagTime > 0) {
    var loadTime = Session.get("load_time");
    loadTime = bufferLoadSpeedSet ?
      (loadTime + lagTime) / 2.0 : lagTime;
    bufferLoadSpeedSet = true;
    //Session.set("load_time", loadTime);
    //console.log("new buffer load time: "+loadTime);
  }

  /*
  // find how long this load took
  client.list({ prefix: path }, function (err, data) {
    if (err) { return console.log(err); }
    var size = data.Contents[0].Size;
    var loadSpeed = size / lagTime;

    // average it with current load speed unless this is first set
    if (lagTime > 0) {
      BUFFER_LOAD_SPEED = bufferLoadSpeedSet ?
        (BUFFER_LOAD_SPEED + loadSpeed) / 2.0 : loadSpeed;
      bufferLoadSpeedSet = true;
    }

    console.log("updateBuffer path: "+path+", lagTime: "+lagTime+", size: "+size);
  });
  */
};