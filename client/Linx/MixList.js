Template.MixList.created = function() {
  this.mix = new ReactiveVar();
  this.autorun(setMix.bind(this));
};

Template.MixList.helpers({
  songs: function() {
    var mix = Template.instance().mix.get();
    return mix.getSongs();
  }
});

function setMix() {
  // TODO: default to queue
  var mixId = Session.get('editMix');
  this.mix.set(Mixes.findOne(mixId));
}
