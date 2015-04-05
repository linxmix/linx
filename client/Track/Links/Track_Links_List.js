Template.Track_Links_List.created = function() {
  Utils.initTemplateModel.call(this, 'track');
  Utils.requireTemplateData.call(this, 'onClick');
};

Template.Track_Links_List.helpers({
  trackLinksInfo: function() {
    var data = Template.currentData();
    var onClick = data.onClick;
    var linkIds = data.linkIds || [];
    var activeTrackId = data.track.get('_id');
    var trackLinksInfo = {};

    // collect links into hash with counts
    linkIds.forEach(function(linkId) {
      var link = Links.findOne(linkId);
      var fromTrack = link.fromTrack();
      var toTrack = link.toTrack();
      var activeIsFromTrack = fromTrack.get('_id') === activeTrackId;
      var otherTrack = activeIsFromTrack ? toTrack : fromTrack;
      var otherTrackId = otherTrack.get('_id');

      // add if not in hash
      if (!trackLinksInfo[otherTrackId]) {
        trackLinksInfo[otherTrackId] = {
          track: otherTrack,
          onClick: onClick,
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

    return _.values(trackLinksInfo);
      

    //       also write reactive algorithm to auto draw wave links
    //       oh, that's just in track wave - write a function that draws links from a given list of links, reactively
    //         - note that will take some thinking in terms of regions
  },
});

Template.Track_Link_List.created = function() {
  Utils.initTemplateModel.call(this, 'track');
};

Template.Track_Link_List.events({
  'click': function(e, template) {
    template.data.onClick(template.data.track);

    // TODO: move to TrackLinksPage
    /* var _id = template.data._id;
    var current = Router.current();
    var _idA = current.params._idA;
    var _idB = current.params._idB;
    Router.go('tracks.links', _.defaults({
      _idA: Tracks.findOne(_idA) ? _idA : _id,
      _idB: Tracks.findOne(_idB) ? _idB : _id,
    }, current.params)); */
  },
});
