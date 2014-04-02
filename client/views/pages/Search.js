/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Search');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var config = require('../../config');
var echojs = require('echojs');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    /* UNCOMMENTING THIS SECTION CAUSES ERROR when loading searchpage
    var echo = echojs({
      key: config.echoId,
    });

    echo('song/search').get({
      artist: 'radiohead',
      title: 'karma police'
    }, function (err, json) {
      console.log(json.response);
    });
    */

    return (
      <div className="ui grid">
        <div className="sixteen wide column">
        TODO
        </div>
      </div>
    );
  },

});