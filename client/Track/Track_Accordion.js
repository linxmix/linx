Template.Track_Accordion.created = function() {
  Utils.initTemplateModel.call(this, 'track');
  Utils.initTemplateModel.call(this, 'mix');

  this.isActive = new ReactiveVar(false);
};

Template.Track_Accordion.helpers({
  activeClass: function() {
    var isActive = Template.instance().isActive;
    return isActive.get() ? 'active' : '';
  },
});

Template.Track_Accordion.events({
  'click .title': function(e, template) {
    var isActive = template.isActive;
    isActive.set(!isActive.get());
  },

  'click .remove-track': function(e, template) {
    e.preventDefault();
    e.stopPropagation();
    var mix = template.data.mix;
    var track = template.data.track;
    mix.removeTrack(track.get('_id'));
  },

  'click .add-button': function(e, template) {
    e.preventDefault();
    e.stopPropagation();
  },
});
