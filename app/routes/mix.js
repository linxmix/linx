import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    deleteMix: function() {
      var mix = this.get('controller.model');

      if (window.confirm("Are you sure you want to delete this mix? It cannot be restored once deleted.")) {
        mix.destroyRecord();
        this.transitionTo('mixes');
      }
    },

    onPageDrop: function(files) {
      console.log("page drop", files);

      var store = this.get('store');

      // for each file, create track and add to mix
      files.map((file) => {
        var track = store.createRecord('track', {
          title: file.name,
        });

        this.send('appendTrack', track);
      });
    },

    addSeedTrack: function(track) {
      // TODO(AFTERPROMISE): do this easier
      this.get('controller.model.seedList.content').addTrack(track);
    },

    removeSeedTrack: function(track) {
      // TODO(AFTERPROMISE): do this easier
      this.get('controller.model.seedList.content').removeTrack(track);
    },

    previewTrack: function(toTrack) {
      var mix = this.get('controller.model');
      var fromTrack = mix.get('tracks').get('lastObject');
      var transition = this.get('store').createRecord('transition');
      transition.initOverlap(fromTrack, toTrack).then(() => {
        this.transitionTo('mix.transition', transition);
      });
    },

    appendTrack: function(track) {
      var mix = this.get('controller.model');
      mix.appendTrack(track);
    },

    removeTrackAt: function(index) {
      var mix = this.get('controller.model');
      mix.removeTrackAt(index);
    },

    insertTransitionAt: function(index, transition) {
      var mix = this.get('controller.model');
      mix.insertTransitionAt(transition, index);
    },

    createTransitionAt: function(index) {
      var mix = this.get('controller.model');
      mix.createTransitionAt(transition, index);
    },

    removeTransitionAt: function(index) {
      var mix = this.get('controller.model');
      mix.removeTransitionAt(index);
    }
  },

  setupController: function(controller, model) {
    // TODO(AFTERPROMISE): just use promise array
    this.get('store').find('track').then((tracks) => {
      controller.set('searchTracks', tracks.get('content'));
    });

    this._super.apply(this, arguments);
  },

  model: function(params) {
    return this.get('store').find('mix', params.id).then((mix) => {
      return mix;
    }, (reason) => {
      this.transitionTo('mixes');
    });
  }
});
