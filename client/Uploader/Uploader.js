Session.setDefault("uploaderStep", 0);

Template.Uploader.helpers({
  activeStep: function() {
    return 'Step' + (Session.get('uploaderStep') + 1);
  }
});