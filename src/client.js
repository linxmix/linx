// create globals to play with on client
PouchDB = require('pouchdb');
BackbonePouch = require('backbone-pouch');
Marionette = require('backbone.marionette');
Marionette.$ = $;
Backbone = require('backbone.marionette/node_modules/backbone');
Backbone.$ = $;
_ = require('underscore');
Math.uuid = require('node-uuid').v4;

var Linx = require('./app.js');

// load the application once the DOM is ready, using `jQuery.ready`:
$(function () {

  // enable PouchDB debugging
  // Pouch.DEBUG = true;

  // adjust id attribute to the one PouchDB uses.
  Backbone.Model.prototype.idAttribute = '_id';

  Backbone.sync = BackbonePouch.sync({
    // suffix with version in case of necessary upgrade.
    db: PouchDB('linx0'),
  });

  Linx.start();
});

/*Backbone.Marionette.TemplateCache.prototype.loadTemplate = function (templateId) {
  // load your template here, returning the data needed for the compileTemplate
  // function. For example, you have a function that creates templates based on the
  // value of templateId
  return fs.readFileSync(templateId);
}*/


require('./models/track.js');
require('./models/clip.js');
require('./models/sample.js');

require('./views/track.js')
require('./views/clip.js')
require('./views/sample.js')

require('./views/trackList.js')
require('./views/sampleList.js')

require('./controllers/sampler.js');
require('./controllers/tracker.js');

require('./collections/trackList.js');
require('./collections/sampleList.js');
