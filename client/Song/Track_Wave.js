Template.Track_Wave.created = function() {
  this.file = new ReactiveVar(null);
  this.loaded = new ReactiveVar(false);

  // get or make wave
  console.log("create wave");
  this.wave = this.data.wave || Object.create(WaveSurfer);

  initWave.call(this);
  Tracker.autorun(loadFile.bind(this));
}

Template.Track_Wave.rendered = function() {
  // this.$('.wave').hide();
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
      id: 'guess',
      color: 'rgba(255, 255, 255, 0.5)',
    });
  }
}

Template.Track_Wave.helpers({
  loaded: function() {
    return Template.instance().loaded.get();
  },

  enableDrop: function() {
    return this.enableDrop;
  },

  file: function() {
    return Template.instance().file;
  }
});

Template.Track_Wave.events({
  'click .play': function(e, template) {
    template.wave.play();
  },

  'click .pause': function(e, template) {
    template.wave.pause();
  },
})

function initWave() {
  var template = this;
  var wave = this.wave;

  wave.on('loading', function(percent, xhr) {
    wave.isLoaded = false;
    template.$('.progress-bar').show();
    template.$('.progress-bar .bar').css({ 'width': percent + '%' });
  });

  wave.on('ready', function() {
    wave.isLoaded = true;
    template.$('.progress-bar').hide();
    template.$('.wave').show();
    template.loaded.set(true);
    console.log("peaks", wave.getPeaks());
  });

  wave.on('region-created', function(region) {
    // clear previous
    if (wave.regions.list[region.id]) {
      wave.regions.list[region.id].remove();
    }
  });
}

function loadFile(computation) {
  var file = this.file.get();

  if (file) {
    this.wave.loadBlob(file);
    computation.stop()
  }
}
