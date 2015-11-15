import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes(), {

  actions: {
    onSelect(key) {
      this.sendAction('onSelect', key);

      if (this.get('hideOnSelection')) {
        this.hideDropdown();
      }
    }
  },

  classNames: ['LxDropdown', 'ui dropdown'],
  classNameBindings: [],

  // params
  selected: null,
  dropdownOptions: null,
  hideOnSelection: true,

  updateSelection() {
    let $this = this.$();

    $this.dropdown('set exactly', this.get('selected') || []);
  },

  hideDropdown() {
    if (!this.get('isInDom')) { return; }
    let $this = this.$();

    $this.dropdown('hide');
  },

  initDropdown: Ember.observer('dropdownOptions', function() {
    let $this = this.$();
    let dropdownOptions = this.get('dropdownOptions') || {};

    dropdownOptions.action = (value, key) => {
      this.send('onSelect', key);
    };

    $this.dropdown(dropdownOptions);
    this.updateSelection();
  }).on('didRender'),
});
