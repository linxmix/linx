Template.Track_Accordion.created = function() {
  Utils.initTemplateModel.call(this, 'track', function(newModel, prevModel) {
    // console.log("new accordion model", newModel);
  });
  Utils.initTemplateModel.call(this, 'mix');

  Utils.requireTemplateData.call(this, 'trackModalIndex');
  Utils.requireTemplateData.call(this, 'linkModalIndex');

  Utils.requireTemplateData.call(this, 'position');

  this.isActive = new ReactiveVar(false);
};

function templateIsActive(template) {
  return template.isActive.get();
}

Template.Track_Accordion.helpers({
  activeClass: function() {
    return templateIsActive(Template.instance()) ? 'active' : '';
  },

  showLinkButton: function() {
    var data = Template.currentData();
    var pos = data.position;
    var mix = data.mix;
    return pos < mix.get('trackIds.length');
  },

  linkActiveClass: function() {
    var data = Template.currentData();
    return data.linkModalIndex.get() === data.position ? 'active' : '';
  },

  trackActiveClass: function() {
    var data = Template.currentData();
    return data.trackModalIndex.get() === data.position ? 'active' : '';
  }
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

  'click .add-track': function(e, template) {
    e.preventDefault();
    e.stopPropagation();
    var data = template.data;
    // open add modal with this index
    data.trackModalIndex.set(data.position);
  },

  'click .add-link': function(e, template) {
    e.preventDefault();
    e.stopPropagation();
    var data = template.data;
    // open add modal with this index
    data.linkModalIndex.set(data.position);
    console.log("add link", data.linkModalIndex.get());
  },
});
