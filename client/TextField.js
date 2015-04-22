Template.TextField.created = function() {
  Utils.initTemplateModel.call(this, 'model');
  Utils.requireTemplateData.call(this, 'property');

  this.isEditing = new ReactiveVar(false);
};

Template.TextField.helpers({
  class: function() {
    return Template.currentData().class;
  },

  editClass: function () {
    return Template.instance().isEditing.get() ? 'editing' : '';
  },

  value: function() {
    var data = Template.currentData();
    return data.model.get(data.property);
  },

  isEditing: function() {
    return Template.instance().isEditing.get();
  },
});


Template.TextField.events({
  'dblclick': function(e, template) {
    onEdit(template);
  },
});

function onEdit(template) {
  template.isEditing.set(true);
  _.defer(function() {
    template.$('input').focus();
  });

  // setup handlers
  template.clickHandler = function(e) {
    if (e.target !== template.$('input')[0]) {
      onSubmit(template);
    }
  };
  template.keyHandler = function(e) {
    if (e.which === 13) { onSubmit(template); } // enter
    if (e.which === 27) { onFinish(template); } // escape
  };
  $(window).on('click', template.clickHandler);
  $(window).on('keyup', template.keyHandler);
}

function onSubmit(template) {
  var val = template.$('input').val();

  // update with new, if val is true
  val && template.data.model.set(template.data.property, val);

  onFinish(template);
}

function onFinish(template) {
  template.isEditing.set(false);
  $(window).off('click', template.clickHandler);
  $(window).off('keyup', template.keyHandler);
}
