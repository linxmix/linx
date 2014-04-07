/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Playlists');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var PlaylistSidebar = require('./PlaylistSidebar');
var Slider = require('./Slider');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'sliders': [
        {text: 'Hotttnesss'},
        {text: 'Energy'},
      ]
    }
  },

  render: function () {
    return (
      <div>
        {PlaylistSidebar}
        <div className="ui divider"></div>
        <div className="ui two column middle aligned relaxed grid basic inverted purple segment">
          <div className="center aligned column">
            <div className="huge green ui button">Build Playlist</div>
          </div>
          <div className="ui inverted vertical divider">
            Or
          </div>
          <div className="center aligned column">
            <div className="huge teal ui button">
              Generate Playlist
            </div>
          </div>
        </div>
        <div className="ui divider"></div>
        <div className="ui column">
          {Slider({
            'text': 'Hotttnesss',
            'value': 0
          })}
        </div>

      </div>
    );

  },

});