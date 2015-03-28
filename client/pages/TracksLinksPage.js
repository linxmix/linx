Template.TracksLinksPage.helpers({
  onTrackAReady: function() {
    var _idB = Template.instance().data._idB;
    return function(_id) {
      Router.go(Router.current().route.getName(), {
        _idA: _id,
        _idB: _idB,
      });
    };
  },

  onTrackBReady: function() {
    var _idA = Template.instance().data._idA;
    return function(_id) {
      Router.go(Router.current().route.getName(), {
        _idA: _idA,
        _idB: _id,
      });
    };
  },
});
