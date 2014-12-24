Template.SongsBlock.created = function() {
  this.selectedSong = new ReactiveVar(this.data.selectedSong);
};

Template.SongsBlock.rendered = function() {
  this.$('.songsblock').overscroll({
    showThumbs: false,
    direction: 'vertical',
  }).scroll(function(e) {
    console.log("drag start");
    // e.startPropagation();
  });
};

Template.SongsBlock.helpers({
  songsList: function() {
    var template = Template.instance();
    var songsList = template.data.songsList;
    var selectedSong = template.selectedSong.get();
    if (selectedSong && !_.find(songsList, function(song) { return song._id === selectedSong._id; })) {
      songsList.unshift(selectedSong);
    }
    return songsList;
  },

  isActive: function() {
    var selectedSong = Template.instance().selectedSong.get();
    var isActive = selectedSong && (selectedSong._id === this._id);
    return isActive ? 'active' : '';
  }
});
