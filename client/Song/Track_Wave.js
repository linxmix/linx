Template.Track_Wave.created = function() {
  this.file = new ReactiveVar;
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
    minPxPerSec: 10,
    height: 197,
    fillParent: true,
    cursorWidth: 2,
    renderer: 'Canvas',
  });
}

Template.Track_Wave.helpers({
  loaded: function() {
    return Template.instance().file.get();
  },

  file: function() {
    return Template.instance().file;
  }
});

function initWave() {
  var self = this;

  this.wave.on('loading', function(percent, xhr) {
    self.$('.progress-bar').show();
    console.log("loading", percent);
    self.$('.progress-bar .bar').css({ 'width': percent + '%' });
  });

  this.wave.on('ready', function() {
    console.log('ready')
    self.$('.progress-bar').hide();
    self.$('.wave').show();
  });
}

function loadFile() {
  var file = this.file.get();

  if (file) {

    // hack to access the ArrayBuffer of audio data as it's read
    this.wave.loadArrayBuffer = function(arraybuffer) {
      var my = this;
      this.backend.decodeArrayBuffer(arraybuffer, function (data) {
        my.loadDecodedBuffer(data);
        my.arrayBuffer = data;
      }, function () {
        my.fireEvent('error', 'Error decoding audiobuffer');
      });
    };
    // /hack

    this.wave.loadBlob(file);
  }
}