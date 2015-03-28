Template.Track_Wave.created = function() {
  // setup wave
  var wave = Waves.create();
  this.data._idWave = wave.get('_id');
  prepWaveSurfer(wave, this);
};

Template.Track_Wave.rendered = function() {
  var template = this;
  var data = template.data;
  var wave = Waves.findOne(data._idWave);
  var wavesurfer = wave.getWaveSurfer();

  template.$('.progress-bar').hide();

  wavesurfer.init({
    container: template.$('.wave')[0],
    waveColor: 'violet',
    progressColor: 'purple',
    cursorColor: 'white',
    minPxPerSec: 10,
    height: 150,
    fillParent: true,
    cursorWidth: 2,
    renderer: 'Canvas',
  });

  if (template.enableDragSelection) {
    wavesurfer.enableDragSelection({
      id: 'selected',
      color: 'rgba(255, 255, 255, 0.4)',
      loop: false,
    });
  }

  // TODO
  // if (data._idTrack) {
  //   wave.loadTrack(data._idTrack);
  // }
};

Template.Track_Wave.helpers({
  hiddenClass: function() {
    var wave = Waves.findOne(Template.instance().data._idWave);
    return wave.get('loaded') ? '' : 'hidden';
  },

  isLoaded: function() {
    var wave = Waves.findOne(Template.instance().data._idWave);
    return wave.get('loaded');
  },

  onSubmitSoundcloud: function() {
    var wave = Waves.findOne(Template.instance().data._idWave);
    // create new track with given response
    return function(response) {
      var newTrack = Tracks.build();
      newTrack.setSoundcloud(response);
      wave.loadTrack(newTrack);
    };
  },

  onSelectLinx: function() {
    var wave = Waves.findOne(Template.instance().data._idWave);
    return function(track, results) {
      wave.loadTrack(track);
    };
  }
});

function prepWaveSurfer(wave, template) {
  var wavesurfer = wave.createWaveSurfer();
  wavesurfer.model = wave;

  var lastPercent;
  wavesurfer.on('loading', function(percent, xhr, type) {
    wave.set('loading', true);
    wave.save();
    template.$('.progress-bar').show();

    // update progress bar
    if (percent !== lastPercent) {
      lastPercent = percent;
      var text = {};
      switch (type) {
        case 'upload': text = { active: "Uploading...", success: "Uploaded!" }; break;
        case 'profile': text = { active: "Getting Profile...", success: "Got Profile!" }; break;
        case 'analyze': text = { active: "Analyzing...", success: "Analyzed!" }; break;
        default: text = { active: "Loading...", success: "Decoding..." };
      }
      template.$('.progress-bar').progress({
        percent: percent,
        text: text,
      });
    }
  });

  wavesurfer.on('uploadFinish', function() {
    template.$('.progress-bar').hide();
  });

  wavesurfer.on('ready', function() {
    template.$('.progress-bar').hide();
  });

  wavesurfer.on('reset', function() {
    template.$('.progress-bar').hide();
    template.files.set(null);
  });

  wavesurfer.on('error', function(errorMessage) {
    template.$('.progress-bar').hide();
  });
}
