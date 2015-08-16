import Ember from 'ember';

export default {
  name: "queueServiceSetup",
  after: "store",

  initialize: function(container, application) {
    container.lookup('service:queue')
      .set('store', container.lookup('store:main'));
  }

};
