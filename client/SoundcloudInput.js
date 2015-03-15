Template.SoundcloudInput.created = function() {
  this.isLoadingAjax = new ReactiveVar(false);
  this.error = new ReactiveVar(false);
};

Template.SoundcloudInput.helpers({
  loadingClass: function() {
    var template = Template.instance();
    var waveIsLoading = template.data.wave.isLoading && template.data.wave.isLoading();
    var isLoadingAjax = template.isLoadingAjax.get();
    return waveIsLoading || isLoadingAjax ? 'loading' : '';
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
  var isLoadingAjax = template.isLoadingAjax;
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
  isLoadingAjax.set(true);
  $.ajax({
    type: 'GET',
    url: 'http://api.soundcloud.com/resolve.json',
    data: {
      url: targetUrl,
      client_id: clientId,
    },
    success: function(response) {
      isLoadingAjax.set(false);
      console.log("RESPONSE", response);
      if (!(response && response.streamable && response.stream_url)) {
        window.alert('Sorry, but SoundCloud won\'t let us steam this url', targetUrl);
      } else {
        onSubmit && onSubmit(response);
      }
    },
    error: function(response) {
      isLoadingAjax.set(false);
      error.set(true);
      window.alert('404 error', response);
    }
  });
}
