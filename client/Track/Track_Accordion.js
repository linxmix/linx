Template.Track_Accordion.created = function() {
  Utils.initTemplateModel.call(this, 'track', function(newModel, prevModel) {
    console.log("new accordion model", newModel);
  });
  Utils.initTemplateModel.call(this, 'mix');

  Utils.requireTemplateData.call(this, 'addModalTrackIndex');
  Utils.requireTemplateData.call(this, 'activeLinkPos');

  Utils.requireTemplateData.call(this, 'position');
  Utils.requireTemplateData.call(this, 'onViewLink');

  this.isActive = new ReactiveVar(false);
};

function templateIsActive(template) {
  var data = template.data;
  var pos = data.position;
  var active = data.activeLinkPos.get();
  return template.isActive.get() || active === pos || active + 1 === pos;
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

  linkButtonClass: function() {
    var data = Template.currentData();
    return data.activeLinkPos.get() === data.position ? 'active' : '';
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
    data.addModalTrackIndex.set(data.position);
  },

  'click .view-link': function(e, template) {
    template.data.onViewLink(template.data.position);

    // var trackA = template.data.track;
    // var mix = template.data.mix;
    // var trackB = mix.getTrackAt(template.data.position);
    // Router.go('tracks.links', {
    //   _idA: trackA.get('_id'),
    //   _idB: trackB.get('_id'),
    // });
  },
});
