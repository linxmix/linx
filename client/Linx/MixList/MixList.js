Template.MixList.created = function() {
  this.mix = new ReactiveVar();
  this.autorun(setMix.bind(this));
};

Template.MixList.helpers({
  songs: function() {
    return Template.instance().mix.get().getSongs();
  },

  mix: function() {
    return Template.instance().mix.get();
  }
});

function setMix() {
  var mixId = Session.get('editMix');
  this.mix.set(Mixes.findOne(mixId));
}
