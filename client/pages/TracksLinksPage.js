Template.TracksLinksPage.helpers({
  onTrackReset: function() {
    return onTrackReset.bind(Template.instance());
  },

  onTrackReady: function() {
    return onTrackReady.bind(Template.instance());
  },
});

function onTrackReady(deck, _idTrack) {
  _idTrack = _idTrack || null;
  console.log("on track ready", deck, _idTrack);
  var _idA = this.data._idA;
  var _idB = this.data._idB;
  Router.go(Router.current().route.getName(), {
    _idA: deck === "A" ? _idTrack : _idA,
    _idB: deck === "B" ? _idTrack : _idB,
  });
}

function onTrackReset(deck) {
  console.log("on track reset", deck);
  var _idA = this.data._idA;
  var _idB = this.data._idB;
  Router.go("track.links", {
    _idA: deck === "A" ? null : _idA,
    _idB: deck === "B" ? null : _idB,
  });
}
