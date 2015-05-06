Template.Loading_Modal.created = function() {
  Utils.requireTemplateData.call(this, 'loadingQueue');
};

Template.Loading_Modal.rendered = function() {
  var template = this;
  template.$('.Loading_Modal').modal({
    closable: false,
  }).modal('show');
};

Template.Loading_Modal_Inner.rendered = function() {
  var $progressBar = this.$('.progress-bar');
  $progressBar.hide();

  // auto-update progress
  this.autorun(function() {
    var template = Template.instance();
    var loadingQueue = template.data.loadingQueue;
    var itemModels = loadingQueue.getItems();


    // TODO: fix. should have a loadingTemplate for each loadingItem
    // if (!itemModels.length) {
    //   $progressBar.hide();
    // } else {
    //   $progressBar.progress({
    //     percent: itemModels[0].get('percent'),
    //     text: {
    //       active: itemModels[0].get('activeText'),
    //       success: itemModels[0].get('successText'),
    //     },
    //   });
    // }

  }.bind(this));
};

Template.Loading_Modal_Inner.helpers({


  numberText: function() {
    var template = Template.instance();
    return template.data.loadingQueue.getNumRemaining();


    // var $progressBar = template.$('.progress-bar');

    // // update progress bar
    // $progressBar.show();
    // if (_.isNumber(options.percent)) {
    //   $progressBar.progress({
    //     percent: options.percent,
    //     text: {
    //       active: "Uploading...",
    //       success: "Uploaded!"
    //     },
    //   });
    // }
  },
});
