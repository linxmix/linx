Template.SoundcloudInput.events({
  'keydown': function(e, template) {
    // enter key
    if (e.keyCode === 13) {
      onSubmit(e, template);
    }
  },

  'click .soundcloud': onSubmit,
});

function onSubmit(e, template) {
  var url = template.$('input').val();
  var onSubmit = template.data.onSubmit;
  console.log("onSubmit", url);
  // TODO: verify url, error state if not valid
  onSubmit && onSubmit(url);
}
