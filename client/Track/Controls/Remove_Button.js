Template.Remove_Button.created = function() {
  Utils.initTemplateModel.call(this, 'track');
  Utils.requireTemplateData.call(this, 'onRemoveTrack');
};

Template.Remove_Button.events({
  'click .remove': function(e, template) {
    template.data.onRemoveTrack(template.data.track);
  },
});
