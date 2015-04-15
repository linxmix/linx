var selectedLink; // share between inner and outer
var links; // share between inner and outer

Template.Add_Link_Modal.created = function() {
  // Utils.requireTemplateData.call(this, 'onSubmit');
  // Utils.requireTemplateData.call(this, 'onCancel');

  // Utils.initTemplateModel.call(this, 'fromTrack');
  // Utils.initTemplateModel.call(this, 'fromWave');
  // Utils.initTemplateModel.call(this, 'toTrack');
  // Utils.initTemplateModel.call(this, 'toWave');
};

Template.Add_Link_Modal.rendered = function() {
  var template = this;
  template.$('.modal').modal({
    detachable: true,
    closable: false,
    transition: 'scale',
    onDeny: function() {
      // TODO: this will break if data changes
      template.data.onCancel();
    },
    onApprove: function() {
      // TODO: this will break if data changes
      template.data.onSubmit(selectedLink.get());
    }
  }).modal('show');
};

Template.Add_Link_Modal_Inner.created = function() {
  selectedLink = this.selectedLink = new ReactiveVar(this.data.link);
  links = this.links = new ReactiveVar(_.without([this.data.link], undefined));
};

Template.Add_Link_Modal_Inner.helpers({
  selectedLink: function() {
    return Template.instance().selectedLink.get();
  },

  links: function() {
    return Template.instance().links.get();
  },

  isValidSelection: function() {
    return !!Template.instance().selectedLink.get();
  },

  selectLink: function() {
    var template = Template.instance();
    return function(link) {
      template.link.set(link);
    };
  }
});

Template.Add_Link_Modal_Inner.events({
  'keyup': function (e, template) {
    // TODO
    // console.log("keyup", e);
    // if (e.which === 27) { template.$('.deny').click(); } // escape
    // if (e.which === 13) { template.$('.approve').click(); } // enter
  },
});
