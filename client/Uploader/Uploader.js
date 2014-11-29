Session.setDefault("uploaderStep", 1);

Template.Uploader.helpers({
  startSongHidden: function() {
    var step = Session.get('uploaderStep');
    return step === 2 ? '' : 'hidden';
  },

  endSongHidden: function() {
    var step = Session.get('uploaderStep');
    return step === 3 ? '' : 'hidden';
  },
});