Template.TracksLinksPage.helpers({
  onTrackReset: function() {
    return onTrackReset.bind(Template.instance());
  },

  onTrackReady: function() {
    return onTrackReady.bind(Template.instance());
  },
});

function onTrackReady(deck, _idTrack) {
  console.log("on track ready", deck, _idTrack);
  var _idA = this.data._idA;
  var _idB = this.data._idB;
  Router.go(Router.current().route.getName(), {
    _idA: deck === "A" ? _idTrack : _idA,
    _idB: deck === "B" ? _idTrack : _idB,
  });
}

function onTrackReset(deck) {
  onTrackReady.call(this, deck);
}
