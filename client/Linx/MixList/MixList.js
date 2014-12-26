Template.MixList.created = function() {
  this.mix = new ReactiveVar();
  this.autorun(setMix.bind(this));
};

Template.MixList.rendered = function() {  
  // this.$('.mixlist-content').overscroll({
  //   persistThumbs: true,
  //   thumbColor: '#4F6576',
  //   direction: 'horizontal',
  // });
};

Template.MixList.helpers({
  songsLists: function() {
    var songs = Template.instance().mix.get().getSongs();
    return songs.map(function(song, index) {
      var songsList = (index === 0) ?
        Songs.find().fetch() : songs[index - 1].getSongsOut();
      return {
        selectedSong: song,
        songsList: songsList,
      };
    });
  },

  mix: function() {
    return Template.instance().mix.get();
  }
});

function setMix() {
  var mixId = Session.get('editMix');
  this.mix.set(Mixes.findOne(mixId));
}
