Template.UploadWaveControls.created = function() {
  // TODO: autorun/init based on track.echonest and track._local
  // var track = Template.instance().data.wave.getTrack();
  var uploaded = this.uploaded = new ReactiveVar(false);
  var uploading = this.uploading = new ReactiveVar(false);

  this.data.wave.on('empty', function() {
    uploaded.set(false);
    uploading.set(false);
  });
};

Template.UploadWaveControls.helpers({
  needsUpload: function() {
    return !!(Template.instance().uploaded.get());
  },

  needsUpload: function() {
    return !!(Template.instance().uploaded.get());
  }
});

Template.UploadWaveControls.events({
  'click .empty': function(e, template) {
    template.data.wave.reset();
  },

  'click .upload': function(e, template) {
    if (!template.uploaded.get()) {
      var track = template.data.wave.getTrack();
      var uploading = template.uploading;
      uploading.set(true);
      // upload track to backend
      track && track.upload(function() {
        // analyze track in echonest
        track.analyzeEchonest(function() {
          uploading.set(false);
        });
      });
    }
  },
});

function uploadTrack(wave, uploading) {
  var track = wave.getTrack();

  // TODO: move all this uploading into TrackModel
  // TODO: make idempotent - at each step, only continue if hasn't already been done (or duplicate where ok?)
  // TODO: add data to track along the way. track.setEchonest(), track.setEchonestAnalysis()

  // TODO: show uploading in template
  uploading.set(true);

  // Save to Linx, then upload to Echonest
  function next() {
    console.log('uploadTrack next');
    track.persist();
    uploadToEchoNest(track, function() {
      uploading.set(false);
    });
  }

  // Possibly save to s3
  if (track.getSource() === 's3') {
    // TODO: short-circuit and upload to Echonest straight from S3?
    uploadToS3(wave, next);
  } else {
    next();
  }
}

function uploadToS3(wave, cb) {
  console.log("upload to s3", wave);
  // TODO: upload to s3
  cb && cb();
}

function uploadToEchoNest(track) {
  var streamUrl = track.getStreamUrl();
  // TODO: upload to echo nest in multi-stage process.
  // https://github.com/linxmix/linx/issues/347

}
