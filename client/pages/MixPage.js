Template.MixPage.created = function() {
  Utils.initTemplateModel.call(this, 'mix');

  this.openAccordions = new ReactiveVar([]);
};

function getMix(template) {
  var model = template.data.mix;
  return model;
}

function toggleAccordion(toggleIndex) {
  var template = this;
  var open = template.openAccordions.get();
  var existingIndex = open.indexOf(toggleIndex);

  if (existingIndex > -1) {
    open.splice(existingIndex, 1);
  } else {
    open.push(toggleIndex);
  }

  template.openAccordions.set(open);
}

function getOpenAccordions(template) {
  return template.openAccordions.get();
}

function getClosedAccordions(template) {
  var open = template.openAccordions.get();
  var mix = template.data.mix;
  var closed = [];

  for (var i = 0; i < mix.getLength(); i++) {
    if (open.indexOf(i) === -1) {
      closed.push(i);
    }
  }

  return closed;
}

function allAccordionsOpen(template) {
  var open = getOpenAccordions(template);
  var mix = template.data.mix;

  return open.length === mix.getLength();
}

Template.MixPage.helpers({
  saveButtonClass: function() {
    var mix = getMix(Template.instance());
    return mix.isDirty() ? '' : 'disabled';
  },

  tracksAccordion: function() {
    var template = Template.instance();
    var mix = getMix(template);
    var openAccordions = template.openAccordions.get();

    return mix.getElementData().map(function(data) {
      data.isAccordionOpen = (openAccordions.indexOf(data.index) !== -1);
      data.toggleAccordion = toggleAccordion.bind(template);
      return data;
    });
  },

  allAccordionsOpen: function() {
    return allAccordionsOpen(Template.instance());
  },

  disabledClass: function() {
    return ownsMix(Template.instance()) ? '' : 'disabled';
  },
});

function ownsMix(template) {
  var mix = getMix(template);
  return mix.get('userId') === Meteor.userId();
}

Template.MixPage.events({
  'click .save-mix': function(e, template) {
    var mix = getMix(template);
    var doRedirect = !mix.get('_id');
    console.log('save mix', mix.get('_id'));
    mix.save();
    // redirect to MixPage if this is a new mix
    if (doRedirect) {
      Router.go('mix', {
        _id: mix.get('_id')
      });
    }
  },

  'click .toggle-accordions': function(e, template) {
    if (allAccordionsOpen(template)) {
      template.openAccordions.set([]);
    } else {
      var closedIndices = getClosedAccordions(template);
      template.openAccordions.set(template.openAccordions.get().concat(closedIndices));
    }
  },

  'click .append-track': function(e, template) {
    var mix = getMix(template);
    Router.go('mix.add-track', {
      _id: mix.get('_id'),
      index: mix.getLength(),
    });
  },

  'click .delete-mix': function(e, template) {
    var mix = template.data.mix;
    if (ownsMix(template) && window.confirm("Are you sure you want to delete " + mix.get('title') + "?")) {
      mix.remove();
    }
  },

  'click .auto-link': function(e, template) {
    var loadingQueue = LoadingQueues.create({
      activeText: 'Linking Tracks...',
      successText: 'Linkage Complete!',
    });

    var mix = template.data.mix;
    var elementData = mix.getElementData();
    var loadingItems = [];

    // create loadingItems
    elementData.reduce(function(prev, data) {

      var index = data.index;
      var toTrack = data.track;
      var toWave = data.wave;
      var fromTrack = prev.track;
      var fromWave = prev.wave;
      var fromLink = data.link;

      if (!fromLink && (fromWave && fromTrack && toWave && toTrack)) {
        var loadingItem = LoadingItems.create();

        loadingItem.setCommand(function(options) {
          console.log("running command", index, fromTrack.get('title'), toTrack.get('title'));

          function next() {

            console.log("next", fromWave.getTrack(), fromWave.getAnalysis(), toWave.getTrack(), toWave.getAnalysis());
            // compare waves, then add regions
            var matches = fromWave.compareTo(toWave);

            var bestMatch = matches[0];
            var link = Links.create({
              fromTime: bestMatch.seg1,
              toTime: bestMatch.seg2,
              fromTrackId: fromTrack.get('_id'),
              toTrackId: toTrack.get('_id')
            });
            link.store();
            mix.insertLinkAt(link, index - 1);

            options.onSuccess();
          }

          // make sure track is analyzed
          // TODO: only fire one request
          Echonest.fetchTrackAnalysis(toTrack, function() {
            if (toTrack.getAnalysis() && fromTrack.getAnalysis()) {
              next();
            }
          });
          Echonest.fetchTrackAnalysis(fromTrack, function() {
            if (toTrack.getAnalysis() && fromTrack.getAnalysis()) {
              next();
            }
          });
        });

        loadingItems.push(loadingItem);
      }

      return {
        wave: toWave,
        track: toTrack,
        link: data.link,
      };
    }, {});

    loadingQueue.queueItems(loadingItems);
    loadingQueue.onSuccess(function() {
      Router.go('mix', { _id: mix.get('_id') });
    });

    Router.go('mix.loading', {
      _mixId: mix.get('_id'),
      _queueId: loadingQueue.get('_id')
    });
  },
});
