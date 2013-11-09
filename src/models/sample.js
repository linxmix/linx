var Linx = require('../app.js');

module.exports = Linx.module('Samples', function (Samples, App, Backbone, Marionette, $, _) {

  Samples.Sample = App.Library.Source.extend({
  
    'constructor': function (attributes, options) {
      // if constructor called with file attribute
      if (attributes && (attributes.file instanceof File)) {

        // extract file from attributes
        var file = attributes.file;
        delete attributes.file;

        // use file info to default undefined attributes
        _.defaults(attributes, {
          'name': file.name
        });

        // construct model
        Backbone.Model.call(this, attributes, options)
        
        // attach file
        this.once('sync', function () {
          this.attach(file, file.name, file.type, function (err, result) {
            if (err) throw err;
          });
        });
      } else {
        Backbone.Model.apply(this, arguments);
      }
    },

    'defaults': function () {
      return {
        'type': 'sample',
        'name': "unnamed sample",
      };
    },

    'queue': function () {
      App.Players.conductor.player.queue(this);
    },

    'getWave': function (options, callback) {

      console.log(options, callback);

      // get this sample's blob
      this.getBlob(function (err, blob) {

        // init our wave
        var wave = Object.create(WaveSurfer);
        wave.init(options);

        // create file reader / load with events
        var reader = new FileReader();
        reader.addEventListener('progress', function (e) {
          wave.onProgress(e);
        });
        reader.addEventListener('load', function (e) {
          wave.loadBuffer(e.target.result);
        });
        reader.addEventListener('error', function (err) {
          throw err;
        });

        if (blob) {
          wave.empty();
          reader.readAsArrayBuffer(blob);
        } else {
          return callback(new Error('no blob given to getWave'));
        }
        return callback(null, wave);
      });
    },
  });
});