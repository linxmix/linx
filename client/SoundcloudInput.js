Template.SoundcloudInput.created = function() {
  this.data.isLoadingAjax = new ReactiveVar(false);
  this.data.error = new ReactiveVar(false);
};

Template.SoundcloudInput.helpers({
  loadingClass: function() {
    var data = Template.instance().data;
    var wave = Waves.findOne(data._idWave);
    var waveIsLoading = wave && wave.get('isLoading');
    var isLoadingAjax = data.isLoadingAjax.get();
    return waveIsLoading || isLoadingAjax ? 'loading' : '';
  },

  errorClass: function() {
    return Template.instance().data.error.get() ? 'error' : '';
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
  var data = template.data;
  var targetUrl = template.$('input').val();
  var clientId = Config.clientId_Soundcloud;

  var onSubmit = data.onSubmit;
  var isLoadingAjax = data.isLoadingAjax;
  var error = data.error;
  console.log("onSubmit", targetUrl);

  // verify url, error state if not valid
  var regex = /https?:\/\/soundcloud.com\/.*/;
  if (!targetUrl.match(regex)) {
    return error.set(true);
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
