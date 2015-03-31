Template.TrackLinksList.helpers({
  trackLinksInfo: function() {
    var activeTrackId = Template.instance().data._idTrack;
    var activeTrack = Tracks.findOne(activeTrackId);
    var trackLinksInfo = {};

    if (activeTrack) {
      var trackLinks = activeTrack.getAllLinks();

      // collect trackLinks into hash with counts
      trackLinks.forEach(function(link) {
        var fromTrack = link.fromTrack();
        var toTrack = link.toTrack();
        var activeIsFromTrack = fromTrack.get('_id') === activeTrackId;
        var otherTrack = activeIsFromTrack ? toTrack : fromTrack;
        var otherTrackId = otherTrack.get('_id');

        // add if not in hash
        if (!trackLinksInfo[otherTrackId]) {
          trackLinksInfo[otherTrackId] = {
            _id: otherTrack.get('_id'),
            trackTitle: otherTrack.get('title'),
            toCount: 0,
            fromCount: 0,
          };
        }

        // increment count
        if (activeIsFromTrack) {
          trackLinksInfo[otherTrackId].toCount += 1;
        } else {
          trackLinksInfo[otherTrackId].fromCount += 1;
        }
      });
    }

    return _.values(trackLinksInfo);
      

    //       on click, load that track into deck B
    //       also write reactive algorithm to auto draw wave links
    //       oh, that's just in track wave - write a function that draws links from a given list of links, reactively
    //         - note that will take some thinking in terms of regions
    //        
    //        also need to do save + analysis stuff
    //        and i need to figure out how best to abstract the list stuff, maybe only a few paramters change and the template stays the same.
  },
});

Template.TrackLinkList.events({
  'click': function(e, template) {
    var _id = template.data._id;
    var current = Router.current();
    var _idA = current.params._idA;
    var _idB = current.params._idB;
    Router.go('tracks.links', _.defaults({
      _idA: Tracks.findOne(_idA) ? _idA : _id,
      _idB: Tracks.findOne(_idB) ? _idB : _id,
    }, current.params));
  },
});
