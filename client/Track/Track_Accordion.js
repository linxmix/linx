Template.Track_Accordion.created = function() {
  Utils.initTemplateModel.call(this, 'track', function(newModel, prevModel) {
    // console.log("new accordion model", newModel);
  });
  Utils.initTemplateModel.call(this, 'mix');

  Utils.requireTemplateData.call(this, 'trackModalIndex');
  Utils.requireTemplateData.call(this, 'linkModalIndex');

  Utils.requireTemplateData.call(this, 'index');

  this.isActive = new ReactiveVar(false);
};

function templateIsActive(template) {
  return template.isActive.get();
}

Template.Track_Accordion.helpers({
  position: function() {
    return Template.currentData().index + 1;
  },

  activeClass: function() {
    return templateIsActive(Template.instance()) ? 'active' : '';
  },

  isLastTrack: function() {
    var data = Template.currentData();
    return data.index >= data.mix.getLength() - 1;
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
    var index = template.data.index;
    mix.removeTrackAt(index);
  },

  'click .add-track': function(e, template) {
    e.preventDefault();
    e.stopPropagation();
    var data = template.data;
    // open add modal with this index
    data.trackModalIndex.set(data.index + 1);
  },

  'click .add-link': function(e, template) {
    e.preventDefault();
    e.stopPropagation();
    var data = template.data;
    // open add modal with this index
    data.linkModalIndex.set(data.index + 1);
  },
});
