Session.setDefault("uploaderStep", 1);

Template.Uploader.created = function() {
  this.startSong = Object.create(WaveSurfer);
  this.transition = Object.create(WaveSurfer);
  this.endSong = Object.create(WaveSurfer);
}

Template.Uploader.helpers({
  startSongHidden: function() {
    var step = Session.get('uploaderStep');
    return step === 2 ? '' : 'hidden';
  },

  endSongHidden: function() {
    var step = Session.get('uploaderStep');
    return step === 3 ? '' : 'hidden';
  },

  startSong: function() {
    return Template.instance().startSong;
  },

  transition: function() {
    return Template.instance().transition;
  },

  endSong: function() {
    return Template.instance().endSong;
  },
});