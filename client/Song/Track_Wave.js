Template.Track_Wave.created = function() {
  this.file = new ReactiveVar;
  this.loaded = new ReactiveVar;
  this.loaded.set(false);

  // get or make wave
  console.log("create wave", this.data, this.data.wave);
  this.wave = this.data.wave || Object.create(WaveSurfer);

  initWave.call(this);
  this.loadFile = Deps.autorun(loadFile.bind(this));
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
  var self = this;
  var wave = this.wave;

  wave.on('loading', function(percent, xhr) {
    self.$('.progress-bar').show();
    self.$('.progress-bar .bar').css({ 'width': percent + '%' });
  });

  wave.on('ready', function() {
    self.$('.progress-bar').hide();
    self.$('.wave').show();
    self.loaded.set(true);
    console.log("peaks", wave.getPeaks());
  });

  wave.on('play', function() {
    // Session.set('playing', wave);
  });

  wave.on('region-created', function(region) {
    // clear previous
    if (wave.regions.list[region.id]) {
      wave.regions.list[region.id].remove();
    }
  });
}

function loadFile() {
  var file = this.file.get();

  if (file) {
    this.wave.loadBlob(file);
  }
}