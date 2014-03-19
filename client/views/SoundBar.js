/** @jsx React.DOM */
var debug = require('debug')('views:SoundBar')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Widget = require('./Widget');
var Tab = require('./nav/Tab');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  handleClick: function(soundTab) {
    this.props.changePlayState(soundTab.key);
  },

  getDefaultProps: function() {
    return {
      soundTabs: [
        {key: 'play', name: 'Play'},
        {key: 'pause', name: 'Pause'},
      ],
      widgets: [
        {id: 'widget0', index: 0},
        {id: 'widget1', index: 1},
        {id: 'widget2', index: 2},
      ],
    };
  },

  assertPlayState: function () {
    var widget = this.widget,
        playState = this.props.playState;
    debug('asserting play state: ' + playState)
    if (!widget) return;
    switch (playState) {
      case 'play':
        widget.play();
        break;
      case 'pause':
        widget.pause();
        break;
    }
  },

  render: function () {
    var queue = this.getCollection().queue;

    // make soundTabs
    var soundTabs = this.props.soundTabs.map(function(soundTab) {
      return (
        Tab({
          'active': (soundTab.key === this.props.playState),
          'key': soundTab.key,
          'name': soundTab.name,
          'activeClass': 'active item',
          'inactiveClass': 'item',
          'handleClick': this.handleClick,
        })
      )
    }.bind(this));

    // make widgets
    var widgets = this.props.widgets.map(function(widget) {
      return (
        Widget({
          'active': (widget.index === this.props.widget),
          'id': widget.id,
        })
      )
    }.bind(this));

    // render SoundBar
    return (
      <div className="bottom-menu">
        {widgets}
      </div>
    );
  },


    // TODO: make inactive widgets display:none instead of
    //       having 0 height. will this fix the z indexing..?

    // TODO: bind queue add and remove to fn syncQueue.
    // TODO: make widget model with accessors to:
    //       widget's API, loaded track's id for sync fn

  // rendered component has been mounted to a DOM element
  componentDidMount: function () {
    debug("component mounted");
    var queue = this.getCollection().queue;

    // setup SC widgets
    var urlBase = "https://w.soundcloud.com/player/"
    var url = urlBase + "?url=http://api.soundcloud.com/users/1539950/favorites&amp;show_playcount=true&amp;show_comments=true&amp;download=true&amp;buying=true&amp;sharing=true&amp;show_bpm=true&amp;liking=true&amp;theme_color=333333";
    var widgetFrames = this.$('iframe');
    var widgets = this.widgets = [];
    for (var i = 0; i < widgetFrames.length; i++) {
      var frame = widgetFrames.get(i);
      frame.setAttribute("src", url);
      var widget = SC.Widget(frame);
      widgets.push(widget);

      // bind SC widget handlers to bubble state up
      /*widget.bind(SC.Widget.Events.PLAY, function (e) {
        this.props.changePlayState('play');
      }.bind(this));

      widget.bind(SC.Widget.Events.PAUSE, function (e) {
        this.props.changePlayState('pause');
      }.bind(this));*/

      // setup mixer functions
      widget.bind(SC.Widget.Events.FINISH, function (e) {
        console.log("widget finished", widget);
        queue.shift();
        var newWidget = (this.props.widget + 1) %
          (this.props.widgets.length);
          var activeWidget = widgets[newWidget];
          activeWidget.play();
          this.props.changeWidget(newWidget);
      }.bind(this));
    }

    queue.on('add', function (track) {
      var index = queue.models.indexOf(track);
      debug("queuing track " + track.get('title') +
        "at index " + index);
      if (index < this.props.widgets.length) {
        widgets[index].load(track.get('uri'));
      }
    }.bind(this));

  },

});