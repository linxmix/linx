//
// Prevent horizontal scroll for Back page in Mac 10.7+
//
// Mac OSX Lion introduces a nasty behavior: when you are scrolling and
// the element (or its parents) are no longer scrollable, then horizontal
// scrolling with two fingers will trigger back page or next page.
//
// For now this plugin provides a way to prevent that behavior for Chrome
// in the case you're scrolling up or left where you can't scroll anymore,
// which triggers back/next page.
//
// Supported browsers: Mac OSX Chrome, Mac OSX Safari, Mac OSX Firefox
// On all other browsers this script won't do anything
//
// Depends on: jquery.mousewheel.js
//
// by Pablo Villalba for http://teambox.com
//
// Licensed under the MIT License
//

import Ember from 'ember';

import _ from 'npm:underscore';

export default Ember.Mixin.create({
  setupMacBackScrollHandler: function() {
    Ember.$(window).on('mousewheel', this.get('onMacBackMouseWheel'));
  }.on('didInsertElement'),

  // TODO: This only prevents scroll when reaching the topmost or leftmost
  // positions of a container. It doesn't handle rightmost or bottom,
  // and Lion scroll can be triggered by scrolling right (or bottom) and then
  // scrolling left without raising your fingers from the scroll position.
  onMacBackMouseWheel: function(event) {
    var preventLeft,
        preventUp,
        x = event.originalEvent.deltaX,
        y = event.originalEvent.deltaY;

    // If none of the parents can be scrolled left when we try to scroll left
    preventLeft = x < 0 && !_(Ember.$(event.target).parents()).detect(function (el) {
      return Ember.$(el).scrollLeft() > 0;
    });

    // If none of the parents can be scrolled up when we try to scroll up
    preventUp = y < 0 && !_(Ember.$(event.target).parents()).detect(function (el) {
      return Ember.$(el).scrollTop() > 0;
    });

    // Prevent futile scroll, which would trigger the Back/Next page event
    if (preventLeft || preventUp) {
      event.preventDefault();
    }
  },

  removeMacBackScrollHandler: function() {
    Ember.$(window).off('mousewheel', this.get('onMacBackMouseWheel'));
  }.on('willDestroyElement')
});
