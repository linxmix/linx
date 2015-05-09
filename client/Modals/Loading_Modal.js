Template.Loading_Modal.created = function() {
  Utils.requireTemplateData.call(this, 'loadingQueue');
};

Template.Loading_Modal.rendered = function() {
  var template = this;
  var loadingQueue = template.data.loadingQueue;
  var $modal = template.$('.Loading_Modal');

  $modal.modal({
    closable: false,
    onVisible: function() {
      // start queue when modal is visible
      Utils.log("visible');")
      loadingQueue.start();
    }
  }).modal('show');

  loadingQueue.onSuccessFirst(function() {
    $modal.modal('hide');
  });

  
};

Template.Loading_Modal_Inner.rendered = function() {
  var $progressBar = this.$('.progress-bar');
  $progressBar.hide();

  // auto-update progress
  this.autorun(function() {
    var template = Template.instance();
    var loadingQueue = template.data.loadingQueue;

    console.log("loadingQueue.getNumProcessing()", loadingQueue.getNumProcessing());
    console.log("loadingQueue.getNumTotal()", loadingQueue.getNumTotal());
    console.log("loadingQueue.getNumComplete()", loadingQueue.getNumComplete());
    console.log("loadingQueue.getNumRemaining()", loadingQueue.getNumRemaining());


    $progressBar.show();
    $progressBar.progress({
      percent: loadingQueue.getProgress(),
      text: {
        active: loadingQueue.get('activeText'),
        success: loadingQueue.get('successText'),
      }
    });


    // TODO: fix. should have a loadingTemplate for each loadingItem
    // var itemModels = loadingQueue.getItems();
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
  numComplete: function() {
    var template = Template.instance();
    return template.data.loadingQueue.getNumComplete();
  },

  numTotal: function() {
    var template = Template.instance();
    return template.data.loadingQueue.getNumTotal();
  },
});
