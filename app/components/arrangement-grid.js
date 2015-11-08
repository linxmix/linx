import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import PreventMacBackScroll from 'linx/mixins/prevent-mac-back-scroll';

import cssStyle from 'linx/lib/computed/css-style';
import { clamp, isNumber } from 'linx/lib/utils';

export default Ember.Component.extend(
  PreventMacBackScroll,
  RequireAttributes('pxPerBeat', 'arrangement'),
  BubbleActions('seekToClick'), {

  // optional params
  isReady: false,
  scrollCenterBeat: null,
  centerBeat: 0,

  classNames: ['ArrangementGrid'],
  classNameBindings: ['isReady::ArrangementGrid--loading'],

  // on click, seekToBeat
  click(e) {
    let $el = this.$();
    let offsetX = e.pageX - ($el.offset().left);
    let scrollLeft = ($el.scrollLeft());
    let x = offsetX + scrollLeft;
    let beat = x / this.get('pxPerBeat');

    this.sendAction('seekToBeat', beat);
  },

  _scrollToCenterBeat: function() {
    if (this.get('isReady')) {
      let scrollCenterBeat = this.get('scrollCenterBeat');

      if (isNumber(scrollCenterBeat)) {
        // console.log('_scrollToCenterBeat', this.get('scrollCenterBeat'));
        this.scrollToBeat(scrollCenterBeat);
      }
    }
  }.observes('scrollCenterBeat', 'isReady'),

  _scrollHandler: null,
  _setupScrollHandler: function() {
    let scrollHandler = (e) => {
      Ember.run.once(this, '_didScroll');
    };

    this.$().on('scroll', scrollHandler);

    this.set('_scrollHandler', scrollHandler);
  }.on('didInsertElement'),

  _teardownScrollHandler: function() {
    this.$().off('scroll', this.get('_scrollHandler'));
  }.on('willDestroyElement'),

  // store previous value of prevPxPerBeat
  prevPxPerBeat: 0,
  _initPrevPxPerBeat: function() {
    this.set('prevPxPerBeat', this.get('pxPerBeat'));
  }.on('init'),

  didInitAttrs(options) {
    console.log('didInitAttrs', options);
  },

  didUpdateAttrs(options) {
    console.log('didUpdateAttrs', options);
  },

  willUpdate(options) {
    console.log('willUpdate', options);
  },

  didReceiveAttrs(options) {
    console.log('didReceiveAttrs', options);
    let { oldAttrs, newAttrs } = options;
    let { pxPerBeat: oldPxPerBeat } = oldAttrs || {};
    let { pxPerBeat: newPxPerBeat } = newAttrs || {};

    if (oldPxPerBeat !== newPxPerBeat) {
      console.log('zoomDidChange');
    }
  },

  willRender() {
    console.log('willRender');
  },

  didRender() {
    console.log('didRender');
  },

  didInsertElement() {
    console.log('didInsertElement');
  },

  didUpdate(options) {
    console.log('didUpdate', options);
  },


  _didScroll() {
    // console.log('_didScroll', this.getProperties('pxPerBeat', 'prevPxPerBeat'));
    // if scrolling due to zoom change, scroll to previous centerBeat
    if (this.get('pxPerBeat') !== this.get('prevPxPerBeat')) {
      this.set('prevPxPerBeat', this.get('pxPerBeat'));
      this.scrollToBeat(this.get('centerBeat'), false);

    // otherwise, the user is scrolling => update centerBeat
    } else {
      this._updateCenterBeat();
    }
  },

  _updateCenterBeat() {
    let pxPerBeat = this.get('pxPerBeat');
    let centerBeat = (this.$().scrollLeft() + this.getHalfWidth()) / pxPerBeat;

    // console.log("_updateCenterBeat", centerBeat, pxPerBeat)

    this.set('centerBeat', centerBeat);
  },

  getHalfWidth() {
    return this.$().innerWidth() / 2.0;
  },

  scrollToBeat(beat, doAnimate = true) {
    // console.log('scrollToBeat', beat);
    let pxPerBeat = this.get('pxPerBeat');
    let $this = this.$();

    // since we are setting scrollLeft, adjust halfway
    let beatPx = (pxPerBeat * beat) - this.getHalfWidth();
    let maxScroll = $this[0].scrollWidth - $this.innerWidth();
    let scrollLeft = clamp(0, beatPx, maxScroll);

    if (doAnimate) {
      $this.animate({
        scrollLeft: scrollLeft
      });
    } else {
      $this.scrollLeft(scrollLeft);
    }
  },
});
