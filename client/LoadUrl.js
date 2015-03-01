Template.LoadUrl.events({
  'keydown': function(e, template) {
    // enter key
    if (e.keyCode === 13) {
      var url = template.$('input').val();
      var onLoad = template.data.onLoad;
      console.log("onLoad", url);
      onLoad && onLoad(url);
    }
  }
});
