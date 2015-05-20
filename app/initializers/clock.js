import Ember from 'ember';
// import Clock from 'linx/lib/clock';

export default {
  name: 'clock',

  initialize: function(container, application) {
    // application.clock = Clock.create();
    console.log('init clock', application.clock);
  },

  destroy: function(container, application) {
    var clock = application.clock;
    clock && clock.destroy && clock.destroy();
  }
};
