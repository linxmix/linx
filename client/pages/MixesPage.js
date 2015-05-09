Template.MixesPage.created = function() {
  Utils.initTemplateModel.call(this, 'myMixes');
  Utils.initTemplateModel.call(this, 'otherMixes');
};

Template.MixesPage.events({
  'click .create-mix': function(e, template) {
    Router.go('mix.new');
  },
});

Template.MixesPage.helpers({
  myMixesHeader: function() {
    var myMixes = Template.currentData().myMixes;
    return 'My Mixes (' + myMixes.length + ')';
  },

  otherMixesHeader: function() {
    var otherMixes = Template.currentData().otherMixes;
    return 'Other Mixes (' + otherMixes.length + ')';
  },
})
