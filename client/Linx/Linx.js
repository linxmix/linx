Session.setDefault('linxView', 'Graph');

Template.Linx.created = function() {
  this.template = new ReactiveVar('Graph');

  this.autorun(updateTemplate.bind(this));
};

Template.Linx.events({
  'click .graph-select': function(e, template) {
    Session.set('linxView', 'Graph');
  },

  'click .list-select': function(e, template) {
    Session.set('linxView', 'List');
  },
});

Template.Linx.helpers({
  template: function() {
    return Template.instance().template.get();
  },

  data: function() {
    // Hack to update template when data is changed
    var instance = Template.instance();
    updateTemplate.call(instance);
    return instance.data;
  },

  graphClass: function() {
    return Session.equals('linxView', 'Graph') ? 'positive' : '';
  },

  listClass: function() {
    return Session.equals('linxView', 'List') ? 'positive' : '';
  },
});

function updateTemplate(computation) {
  var type = this.data.type,
      selectedView = Session.get('linxView'),
      newTemplate;

  if (selectedView === 'Graph') {
    newTemplate = selectedView;
  } else {
    switch (type) {
      case 'library': case 'crate':
         newTemplate = 'TrackList'; break;
      case 'queue': case 'mix':
         newTemplate = 'MixList'; break;
      case 'timeline':
         newTemplate = 'TimeLine'; break;
    }
  }

  this.template.set(newTemplate);
}
