Template.TrackLinksList.helpers({
  'click': function(e, template) {
    template.data.onClick && template.data.onClick(e, template);
  },

  trackLinks: function() {
    var data = Template.instance().data;
    var track = Tracks.findOne(data._idTrack);
    var trackLinks = {};
    console.log("tack", track);

    // TODO: move getLinks into track model.
    //       should fetch all track links, 
    //       then here i want to filter for unique tracks, with count of # of links to and # links from
    //        - maybe display in table rather than list?or pretty list?
    //       on click, load that track into deck B
    //       also write reactive algorithm to auto draw wave links
    //       oh, that's just in track wave - write a function that draws links from a given list of links, reactively
    //         - note that will take some thinking in terms of regions
    //        
    //        also need to do save + analysis stuff
    //        and i need to figure out how best to abstract the list stuff, maybe only a few paramters change and the template stays the same.
    return _.values(trackLinks);
  },
});
