var selectedLink; // share between inner and outer

function isValidSelection() {
  return !!selectedLink.get();
}

function keyHandler(e) {
  if (e.which === 27) { $('.Add_Link_Modal .deny').click(); } // escape
  if (e.which === 13) { $('.Add_Link_Modal .approve').click(); } // enter
}

Template.Add_Link_Modal.created = function() {
  Utils.requireTemplateData.call(this, 'onSubmit');
  Utils.requireTemplateData.call(this, 'onCancel');

  Utils.initTemplateModel.call(this, 'fromTrack');
  Utils.initTemplateModel.call(this, 'toTrack');

  $(window).on('keyup', keyHandler);
};

Template.Add_Link_Modal.rendered = function() {
  var template = this;
  template.$('.modal').modal({
    detachable: true,
    closable: false,
    transition: 'scale',
    onDeny: function() {
      $(window).off('keyup', keyHandler);
      template.data.onCancel();
    },
    onApprove: function() {
      if (isValidSelection()) {
        $(window).off('keyup', keyHandler);
        template.data.onSubmit(selectedLink.get());
        return true;
      } else {
        return false;
      }
    }
  }).modal('show');
};

Template.Add_Link_Modal_Inner.created = function() {
  this.fromWave = Waves.create();
  this.toWave = Waves.create();
  this.fromWave.setNextWave(this.toWave);
  this.toWave.setPrevWave(this.fromWave);

  selectedLink = this.selectedLink = new ReactiveVar();
  var initialSelection = this.data.selectedLink;
  initialSelection && selectLink(this, initialSelection);

  this.isComparing = new ReactiveVar(false);
};

Template.Add_Link_Modal_Inner.rendered = function() {
  this.data.fromTrack.fetchEchonestAnalysis();
  this.data.toTrack.fetchEchonestAnalysis();

  this.$('.Add_Link_Modal_Loader').hide();
};

function selectLink(template, link) {
  console.log("select link", link.get('_id'));

  template.selectedLink.set(link);

  // update waves
  template.fromWave.setLinkFrom(link);
  template.toWave.setLinkTo(link);
}

Template.Add_Link_Modal_Inner.helpers({
  fromWave: function() {
    return Template.instance().fromWave;
  },

  toWave: function() {
    return Template.instance().toWave;
  },

  isComparing: function() {
    return Template.instance().isComparing.get();
  },

  compareButtonClass: function() {
    var template = Template.instance();
    var fromWave = template.fromWave;
    var toWave = template.toWave;

    return (fromWave.getAnalysis() && toWave.getAnalysis()) ? '' : 'disabled';
  },

  onRegionClick: function() {
    var template = Template.instance();
    return function(region) {
      // console.log("add link modal region click", region);
      selectLink(template, region.link());
    };
  },

  onRegionDblClick: function() {
    var template = Template.instance();
    return function() {
      // console.log("add link modal region dbl click", region);
      template.fromWave.playLinkFrom();
    };
  },

  addButtonClass: function() {
    return isValidSelection() ? '' : 'basic disabled';
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
    var fromWave = template.fromWave;
    var toWave = template.toWave;

    // display spinner before executing
    template.$('.Add_Link_Modal_Loader').show(function() {

      _.defer(function() {

        // clear prev regions
        (this.prevRegions || []).forEach(function(region) {
          region.destroy();
        });

        // compare waves, then add regions
        var matches = fromWave.compareTo(toWave);
        var fromTrack = template.data.fromTrack;
        var toTrack = template.data.toTrack;

        var LENGTH = 4;
        var colors = Utils.generateColors(LENGTH);

        // TODO: move this all into wave?
        var regions = [];
        for (var i = 0; i < LENGTH; i++) {
          var match = matches[i];

          var link = Links.create({
            isNew: true,
            fromTime: match.seg1,
            toTime: match.seg2,
            fromTrackId: fromTrack.get('_id'),
            toTrackId: toTrack.get('_id')
          });

          var params = {
            linkId: link.get('_id'),
            color: colors[i]
          };

          regions.push(fromWave.regions.add(_.defaults({
            start: match.seg1,
          }, params)));

          regions.push(toWave.regions.add(_.defaults({
            start: match.seg2,
          }, params)));
        }
        this.prevRegions = regions;

        // done, so remove spinner
        template.$('.Add_Link_Modal_Loader').hide();
      });
    });

  }
});
