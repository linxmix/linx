Template.Track_Wave.created = function() {
  // get or make wave
  this.wave = this.data.wave || Object.create(WaveSurfer);
  initWave.call(this);
};

Template.Track_Wave.rendered = function() {
  this.$('.progress-bar').hide();
  this.wave.init({
    container: this.$('.wave')[0],
    waveColor: 'violet',
    progressColor: 'purple',
    cursorColor: 'white',
    minPxPerSec: 10,
    height: 150,
    fillParent: true,
    cursorWidth: 2,
    renderer: 'Canvas',
  });

  if (this.data.enableDragSelection) {
    this.wave.enableDragSelection({
      id: 'selected',
      color: 'rgba(255, 255, 255, 0.4)',
      drag: false,
      loop: false,
      resize: false,
    });
  }
};

Template.Track_Wave.helpers({
  hiddenClass: function() {
    return Template.instance().wave.isLoaded.get() ? '' : 'hidden';
  },

  isLoaded: function() {
    return Template.instance().wave.isLoaded.get();
  },

  wave: function() {
    return Template.instance().wave;
  }
});

function initWave() {
  var template = this;
  var wave = this.wave;
  wave.isLoaded = new ReactiveVar(false);
  wave.isLoading = new ReactiveVar(false);
  wave.meta = new ReactiveVar(null);

  var lastPercent;
  wave.on('loading', function(percent, xhr, type) {
    wave.isLoading.set(true);
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

  wave.on('uploadFinish', function() {
    wave.isLoading.set(false);
    template.$('.progress-bar').hide();
  });

  wave.on('ready', function() {
    wave.isLoaded.set(true);
    wave.isLoading.set(false);
    template.$('.progress-bar').hide();
    template.data.onReady && template.data.onReady(wave);
  });

  wave.on('reset', function() {
    wave.isLoaded.set(false);
    wave.isLoading.set(false);
  });

  wave.on('error', function(errorMessage) {
    template.$('.progress-bar').hide();
    wave.isLoading.set(false);
    window.alert("Wave Load Error: ", errorMessage);
  });

  wave.on('region-created', function(region) {
    // clear previous
    if (wave.regions.list[region.id]) {
      wave.regions.list[region.id].remove();
    }
  });
}
