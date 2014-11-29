Template.Track_Wave.created = function() {
  this.file = new ReactiveVar;
  this.loaded = new ReactiveVar;
  this.loaded.set(false);

  console.log("create wave");
  this.wave = Object.create(WaveSurfer);
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
    height: 197,
    fillParent: true,
    cursorWidth: 2,
    renderer: 'Canvas',
  });
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
  });

  wave.on('play', function() {
    Session.set('playing', wave);
  })
}

function loadFile() {
  var file = this.file.get();

  if (file) {

    this.wave.loadBlob(file);
  }
}