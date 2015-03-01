Template.UploadWave.helpers({
  onLoadUrl: function() {
    var template = Template.instance();
    return function(url) {
      console.log("UploadWave onLoadUrl", url);
      template.data.wave.load(url);
    };
  },

  onSelectSong: function() {
    return function() {
      console.log("UploadWave onSelectSong");
    };
  }
});
