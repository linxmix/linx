Template.Reset_Button.created = function() {
  Utils.initTemplateModel.call(this, 'wave');
};

Template.Reset_Button.events({
  'click .reset': function(e, template) {
    template.data.wave.reset();
  },
});
