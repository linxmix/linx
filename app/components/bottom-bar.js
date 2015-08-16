import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('isActive'), {

  actions: {},
  classNames: 'BottomBar ui bottom sidebar',
  classNameBindings: [],

  // params
  $sidebar: function() {
    return this.$();
  }.property().volatile(),

  initSideBar: function() {
    this.get('$sidebar').sidebar({
      closable: false,
      dimPage: false,
      transition: 'overlay',
      context: $('.application')
    });

    this.updateSideBar();
  }.on('didInsertElement'),

  activeDidChange: function() {
    let $sidebar = this.get('$sidebar');
    if ($sidebar) {
      Ember.run.once(this, 'updateSideBar');
    }
  }.observes('isActive'),

  updateSideBar() {
    let $sidebar = this.get('$sidebar');

    if (this.get('isActive')) {
      $sidebar.sidebar('show');
    } else {
      $sidebar.sidebar('hide');
    }
  },
});

