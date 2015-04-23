Template.Track_Type.created = function() {
  Utils.initTemplateModel.call(this, 'track');
};

Template.Track_Type.helpers({
  trackType: function() {
    var type = Template.currentData().track.get('type');
    if (type === 'song') { return; }
    return type;
  },

  trackTypeClass: function() {
    var type = Template.currentData().track.get('type');
    switch (type) {
      case 'transition': return 'semantic-green';
      case 'mix': return 'semantic-purple';
    }
  }
});
