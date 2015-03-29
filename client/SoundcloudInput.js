Template.SoundcloudInput.created = function() {
  this.ajaxIsLoading = new ReactiveVar(false);
  this.error = new ReactiveVar(false);
  console.log("soundcloud input created");
};

Template.SoundcloudInput.helpers({
  loadingClass: function() {
    var ajaxIsLoading = Template.instance().ajaxIsLoading.get();
    return ajaxIsLoading ? 'loading' : '';
  },

  errorClass: function() {
    return Template.instance().error.get() ? 'error' : '';
  },
});

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
  var targetUrl = template.$('input').val();
  var clientId = Config.clientId_Soundcloud;

  var onSubmit = template.data.onSubmit;
  var ajaxIsLoading = template.ajaxIsLoading;
  var error = template.error;
  console.log("onSubmit", targetUrl);

  // verify url, error state if not valid
  var regex = /https?:\/\/soundcloud.com\/.*/;
  if (!targetUrl.match(regex)) {
    return error.set(true);
  } else {
    error.set(false);
  }

  // resolve url to get stream_url
  ajaxIsLoading.set(true);
  $.ajax({
    type: 'GET',
    url: 'http://api.soundcloud.com/resolve.json',
    data: {
      url: targetUrl,
      client_id: clientId,
    },
    success: function(response) {
      ajaxIsLoading.set(false);
      console.log("RESPONSE", response);
      if (!(response && response.streamable && response.stream_url)) {
        window.alert('Sorry, but SoundCloud won\'t let us steam this url', targetUrl);
      } else {
        onSubmit && onSubmit(response);
      }
    },
    error: function(response) {
      ajaxIsLoading.set(false);
      error.set(true);
      window.alert('404 error', response);
    }
  });
}
