Template.Track_Accordion.created = function() {
  Utils.initTemplateModel.call(this, 'track');
  Utils.initTemplateModel.call(this, 'wave');
  Utils.initTemplateModel.call(this, 'mix');

  Utils.requireTemplateData.call(this, 'index');
  Utils.requireTemplateData.call(this, 'isAccordionOpen');
  Utils.requireTemplateData.call(this, 'toggleAccordion');
};

Template.Track_Accordion.helpers({
  position: function() {
    return Template.currentData().index + 1;
  },

  activeClass: function() {
    return Template.currentData().isAccordionOpen ? 'active' : '';
  },

  isLastTrack: function() {
    var data = Template.currentData();
    return data.index >= data.mix.getLength() - 1;
  },
});

Template.Track_Accordion.events({
  'click .title': function(e, template) {
    template.data.toggleAccordion(template.data.index);
  },

  'click .remove-track': function(e, template) {
    e.preventDefault();
    e.stopPropagation();
    var mix = template.data.mix;
    var index = template.data.index;
    mix.removeTrackAt(index);
  },

  'click .add-track': function(e, template) {
    e.preventDefault();
    e.stopPropagation();

    var data = template.data;
    Router.go('mix.add-track', {
      _id: data.mix.get('_id'),
      index: data.index + 1,
    });
  },

  'click .add-link': function(e, template) {
    e.preventDefault();
    e.stopPropagation();

    var data = template.data;
    Router.go('mix.add-link', {
      _id: data.mix.get('_id'),
      index: data.index,
    });
  },
});
