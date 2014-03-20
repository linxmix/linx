/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:track/Track_SCWidget');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  // TODO: make able to queue song more than once?
  // TODO: make empty widget display none
  // TODO: make it so widget plays immediately on shift
  /* TODO: height should not be fixed in pixels */
  render: function () {
    return (
      <div>
        <iframe id={this.props.id} width="100%" height="160px"
          scrolling="no" frameBorder="yes"></iframe>
      </div>
    );
  },


  // rendered component has been mounted to a DOM element
  componentDidMount: function () {
    debug("component mounted");
    var widgets = this.getCollection().widgets;

    // setup SC widget
    var urlBase = "https://w.soundcloud.com/player/"
    var url = urlBase + "?url=http://api.soundcloud.com/users/1539950/favorites&amp;show_playcount=true&amp;show_comments=true&amp;download=true&amp;buying=true&amp;sharing=true&amp;show_bpm=true&amp;liking=true&amp;theme_color=333333";
    var widgetFrame = this.$('iframe').get(0);
    widgetFrame.setAttribute("src", url);
    var widget = this.widget = SC.Widget(widgetFrame);

    // add widget to collection
    widgets.add({
      'id': this.props.id,
      'index': this.props.index,
      'widget': widget,
    });

    //
    // bind SC widget handlers to bubble state up
    //
    widget.bind(SC.Widget.Events.PLAY, function (e) {
      if (this.props.active && 
        (this.props.playState !== 'play')) {
        debug("widget event: PLAY");
        this.props.changePlayState('play');
      }
    }.bind(this));

    widget.bind(SC.Widget.Events.PAUSE, function (e) {
      if (this.props.active &&
        (this.props.playState !== 'pause')) {
        debug("widget event: PAUSE");
        this.props.changePlayState('pause');
      }
    }.bind(this));

    widget.bind(SC.Widget.Events.LOAD_PROGRESS, function (e) {
      debug("widget event: LOAD_PROGRESS", e);
    }.bind(this));

    widget.bind(SC.Widget.Events.FINISH, function() {
      debug("widget event: FINISH");
      // update activeWidget
      var nextWidget = (this.props.index + 1) % widgets.length;
      this.props.setActiveWidget(nextWidget);
      // cycle queue
      this.getCollection().queue.shift();
    }.bind(this));
    //
    // /bind
    //

  },

});