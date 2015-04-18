var selectedLink; // share between inner and outer

function keyHandler(e) {
  if (e.which === 27) { $('.Add_Link_Modal .deny').click(); } // escape
  if (e.which === 13) { $('.Add_Link_Modal .approve').click(); } // enter
}

Template.Add_Link_Modal.created = function() {
  Utils.requireTemplateData.call(this, 'onSubmit');
  Utils.requireTemplateData.call(this, 'onCancel');

  Utils.initTemplateModel.call(this, 'fromTrack');
  Utils.initTemplateModel.call(this, 'fromWave');
  Utils.initTemplateModel.call(this, 'toTrack');
  Utils.initTemplateModel.call(this, 'toWave');

  $(window).on('keyup', keyHandler);
};

Template.Add_Link_Modal.rendered = function() {
  var template = this;
  template.$('.modal').modal({
    detachable: true,
    closable: false,
    transition: 'scale',
    onDeny: function() {
      // TODO: this will break if data changes
      template.data.onCancel();
    },
    onApprove: function() {
      console.log("on approve");
      // TODO: this will break if data changes
      template.data.onSubmit(selectedLink.get());
    }
  }).modal('show');
};

Template.Add_Link_Modal_Inner.created = function() {
  selectedLink = this.selectedLink = new ReactiveVar();

  // setup initial selection
  if (this.data.link) {
    selectLink(this, this.data.link);
  }
};

Template.Add_Link_Modal_Inner.rendered = function() {
  // TODO: make this not conflict with wave loading
  // this.data.fromWave.analyze();
  // this.data.toWave.analyze();

  // TODO: don't do this here
  this.data.fromWave.saveAttrs('nextWaveId', this.data.toWave.get('_id'));
  this.data.toWave.saveAttrs('prevWaveId', this.data.fromWave.get('_id'));

};

function selectLink(template, link) {
  console.log("select link", link.get('_id'));

  template.selectedLink.set(link);

  // update waves
  var fromWave = template.data.fromWave;
  var toWave = template.data.toWave;
  fromWave.saveAttrs('linkFromId', link.get('_id'));
  toWave.saveAttrs('linkToId', link.get('_id'));
}

Template.Add_Link_Modal_Inner.helpers({
  onRegionClick: function() {
    var template = Template.instance();
    return function(region) {
      console.log("add link modal region click", region);
      selectLink(template, region.link());
    };
  },

  onRegionDblClick: function() {
    var template = Template.instance();
    return function(region) {
      console.log("add link modal region dbl click", region);
      selectLink(template, region.link());
      template.data.fromWave.playLinkFrom();
    };
  },

  selectedLink: function() {
    return Template.instance().selectedLink.get();
  },

  links: function() {
    return Template.instance().links.get();
  },

  isValidSelection: function() {
    return !!Template.instance().selectedLink.get();
  },

  selectLink: function() {
    var template = Template.instance();
    return function(link) {
      template.link.set(link);
    };
  }
});

Template.Add_Link_Modal_Inner.events({
  'click .compare': function(e, template) {
    var fromWave = template.data.fromWave;
    var toWave = template.data.toWave;

    console.log("compare waves", fromWave.getAnalysis(), toWave.getAnalysis());
    if (!(fromWave.getAnalysis() && toWave.getAnalysis())) {
      // TODO: make this better
      fromWave.analyze();
      toWave.analyze();
      return;
    } else {
      // compare waves, then add regions
      var matches = fromWave.compareTo(toWave);
      var fromTrack = template.data.fromTrack;
      var toTrack = template.data.toTrack;

      var LENGTH = 4;
      var colors = Utils.generateColors(LENGTH);

      // TODO: move this all into wave?
      for (var i = 0; i < LENGTH; i++) {
        var match = matches[i];

        // TODO: need to clean up old links
        var link = Links.create({
          fromTime: match.seg1,
          toTime: match.seg2,
          fromTrackId: fromTrack.get('_id'),
          toTrackId: toTrack.get('_id')
        });

        var params = {
          linkId: link.get('_id'),
          color: colors[i]
        };

        fromWave.regions.add(_.defaults({
          start: match.seg1,
        }, params));

        toWave.regions.add(_.defaults({
          start: match.seg2,
        }, params));
      }
    }
  }
});
