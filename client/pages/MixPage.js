Template.MixPage.created = function() {
  Utils.initTemplateModel.call(this, 'mix');
};

function getMix(template) {
  var model = template.data.mix;
  return model;
}

Template.MixPage.helpers({
  trackCountText: function() {
    var trackCount = getMix(Template.instance()).getLength();
    if (!trackCount) {
      return "0 Tracks";
    } else if (trackCount === 1) {
      return "1 Track";
    } else {
      return trackCount + " Tracks";
    }
  },

  linkCountText: function() {
    var linkCount = getMix(Template.instance()).getLinks().length;
    if (!linkCount) {
      return "0 Links";
    } else if (linkCount === 1) {
      return "1 Link";
    } else {
      return linkCount + " Links";
    }
  },

  saveButtonClass: function() {
    var mix = getMix(Template.instance());
    return mix.isDirty() ? '' : 'disabled';
  },

  tracksAccordion: function() {
    var template = Template.instance();
    var mix = getMix(template);

    return mix.getElementData();
  },
});

Template.MixPage.events({
  'click .save-mix': function(e, template) {
    var mix = getMix(template);
    var doRedirect = !mix.get('_id');
    console.log('save mix', mix.get('_id'));
    mix.save();
    // redirect to MixPage if this is a new mix
    if (doRedirect) {
      Router.go('mix', {
        _id: mix.get('_id')
      });
    }
  },

  'click .append-track': function(e, template) {
    var mix = getMix(template);
    Router.go('mix.add-track', {
      _id: mix.get('_id'),
      index: mix.getLength(),
    });
  }
});
