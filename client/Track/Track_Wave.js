Template.Track_Wave.created = function() {
  this.loaded = new ReactiveVar(false);

  // get or make wave
  this.wave = this.data.wave || Object.create(WaveSurfer);

  initWave.call(this);
};

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
    return Template.instance().loaded.get() ? '' : 'hidden';
  },

  loaded: function() {
    return Template.instance().loaded.get();
  },

  wave: function() {
    return Template.instance().wave;
  }
});

function initWave() {
  var template = this;
  var wave = this.wave;
  wave.meta = new ReactiveVar({});

  wave.on('loading', function(percent, xhr) {
    template.loaded.set(false);
    wave.isLoaded = false;
    template.$('.progress-bar').show();
    template.$('.progress-bar .bar').css({ 'width': percent + '%' });
  });

  wave.on('ready', function() {
    wave.isLoaded = true;
    template.$('.progress-bar').hide();
    template.loaded.set(true);
    template.data.onReady && template.data.onReady(wave);
  });

  wave.on('empty', function() {
    wave.isLoaded = false,
    template.loaded.set(false);
  });

  wave.on('error', function(errorMessage) {
    template.$('.progress-bar').hide();
    template.$('.progress-bar .bar').css({ 'width': 0 });
    window.alert("Wave Load Error: ", errorMessage);
  });

  wave.on('region-created', function(region) {
    // clear previous
    if (wave.regions.list[region.id]) {
      wave.regions.list[region.id].remove();
    }
  });
}
