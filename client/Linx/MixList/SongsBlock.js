Template.SongsBlock.created = function() {
  this.selectedSong = new ReactiveVar(this.data.selectedSong);
};

Template.SongsBlock.rendered = function() {
  this.$('.songsblock .list').overscroll({
    // persistThumbs: true,
    thumbColor: '#4F6576',
    direction: 'vertical',
  }).on('mousewheel', function(e) {
    console.log("scroll", e.currentTarget.scrollLeft, e.currentTarget.scrollTop);
    e.stopPropagation();
    // $('.mixlist-content').trigger(e);
    // TODO: debug
  });

  // TODO: debug, make reactive
  this.$('.search').search({
    type: 'simple',
    source: Songs.find().fetch(),
    searchFields: [
      'title'
    ],
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
  },

  numSongsOut: function() {
    return this.getSongsOut().length;
  },

  isOne: function() {
    return this.getSongsOut().length === 1;
  }
});

Template.SongsBlock.events({
  'click .remove': function(e, template) {
    console.log("remove", this.index, template.data.index);
    Mixes.findOne(Session.get('editMix')).removeAt(this.index);
  },

  'click .selection.list .item': function(e, template) {
    var selectedSong = template.selectedSong;
    console.log('select', this._id, this, selectedSong.get());

    if (selectedSong.get()) {
      if (selectedSong.get()._id !== this._id) {
        selectedSong.set(this._id);
        var mix = Mixes.findOne(Session.get('editMix'));
        mix.replaceAt(this._id, template.data.index);
      }
    } else {
      var mix = Mixes.findOne(Session.get('editMix'));
      mix.add(this._id);
    }
  },
});
