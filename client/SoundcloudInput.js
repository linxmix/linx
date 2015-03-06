Template.SoundcloudInput.created = function() {
  this.loading = new ReactiveVar(false);
  this.error = new ReactiveVar(false);
};

Template.SoundcloudInput.helpers({
  loadingClass: function() {
    return Template.instance().loading.get() ? 'loading' : '';
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
  var loading = template.loading;
  var error = template.error;
  console.log("onSubmit", targetUrl);

  // verify url, error state if not valid
  var regex = /https?:\/\/soundcloud.com\/.*/;
  if (!targetUrl.match(regex)) {
    error.set(true);
    return;
  } else {
    error.set(false);
  }

  // resolve url to get stream_url
  loading.set(true);
  $.ajax({
    type: 'GET',
    url: 'http://api.soundcloud.com/resolve.json',
    data: {
      url: targetUrl,
      client_id: clientId,
    },
    success: function(response) {
      loading.set(false);
      console.log("RESPONSE", response);
      if (!(response && response.streamable && response.stream_url)) {
        window.alert('Sorry, but SoundCloud won\'t let us steam this url', targetUrl);
      } else {
        onSubmit && onSubmit(response);
      }
    },
    error: function(response) {
      loading.set(false);
      error.set(true);
      window.alert('404 error', response);
    }
  });
}
