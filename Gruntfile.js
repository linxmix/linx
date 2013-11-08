module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-spritesmith');
  grunt.loadNpmTasks('grunt-hashres');

  grunt.registerTask('default', ['dev']);
  grunt.registerTask('html', ['jst', 'browserify:jst']);
  grunt.registerTask('css', ['sprite', 'less']);
  grunt.registerTask('js', ['browserify:vendor', 'browserify:app']);
  grunt.registerTask('build', ['clean', 'html', 'js', 'css', 'assets']);
  grunt.registerTask('assets', ['copy:assets']);
  grunt.registerTask('server', ['express']);
  grunt.registerTask('dev', ['build', 'server', 'watch']);
  grunt.registerTask('minify', ['cssmin', 'uglify']);
  grunt.registerTask('deploy', ['build', 'minify', 'hashres', 'gh-pages']);

  var jsVendors = [
    'bower_components/jquery/jquery.js',
    'bower_components/jquery-ui/ui/jquery-ui.js',
    'node_modules/bootstrap/dist/js/bootstrap.js',
    'node_modules/wavesurfer.js/build/wavesurfer.min.js',
  ];
  var defaultBanner = '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n';
  var lessPaths = [
    'node_modules/bootstrap/less/',
    'src/less/',
  ];
  var fontFiles = [
    'node_modules/bootstrap/fonts/*',
    'bower_components/font-awesome/font/*',
  ];

  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),
    'clean': ['build'],
    'jst': {
      'build': {
        'options': {
          'templateSettings': {
            'interpolate' : /\{\{(.+?)\}\}/g
          },
          'processName': function (filename) {
            return filename.replace(/^src\/templates\//, '').replace(/.html$/, '');
          },
          'prettify': true,
        },
        'src': 'src/templates/**/*.html',
        'dest': 'build/js/templates.js',
      },
    },
    'browserify': {
      'vendor': {
        'src': jsVendors,
        'dest': 'build/js/vendor.js',
        'options': {
          'debug': true,
          'shim': {
            'jquery': {
              'path': jsVendors[0],
              'exports': '$',
            },
            'jqueryui': {
              'path': jsVendors[1],
              'exports': null,
              'depends': { 'jquery': '$'},
            },
            'bootstrap': {
              'path': jsVendors[2],
              'exports': null,
              'depends': { 'jquery': '$'},
            },
            'wavesurfer': {
              'path': jsVendors[3],
              'exports': 'WaveSurfer',
            },
          },
        },
      },
      'jst': {
        'src': 'build/js/templates.js',
        'dest': 'build/js/templates.js',
        'options': {
          'shim': {
            'templates': {
              'path': 'build/js/templates.js',
              'exports': 'JST',
            },
          },
        },
      },
      'app': {
        'src': 'src/client.js',
        'dest': 'build/js/app.js',
        'options': {
          'debug': true,
          'transform': ['brfs'],
          'external': ['jquery', 'wavesurfer', 'templates'],
        },
      },
    },

    'sprite': {
      'build': {
        'src': 'assets/sprites/*.png',
        'destImg': 'build/sprites/spritesheet.png',
        'destCSS': 'build/sprites/appsprites.less',
      },
    },

    'less': {
      'options': {
        'paths': lessPaths,
        'compress': false,
      },
      'build': {
        'src': 'src/less/index.less',
        'dest': 'build/css/index.css',
      },
    },

    'copy': {
      'fonts': {
        'src': fontFiles,
        'dest': 'build/fonts/',
        'expand': true,
        'flatten': true,
        'filter': 'isFile',
      },
      'assets': {
        'cwd': 'assets',
        'src': '**/*',
        'dest': 'build',
        'expand': true,
      }
    },

    'express': {
      'server': {
        'options': {
          'server': './src/server.js',
          'bases': 'build',
          'livereload': true,
          'port': 5000,
        },
      },
    },

    'watch': {
      'all': {
        'files': ['Gruntfile.js'],
        'tasks': ['build'],
      },
      'js': {
        'files': ['src/**/*.js'],
        'tasks': ['js'],
      },
      'css': {
        'files': ['src/less/**/*.less'],
        'tasks': ['css']
      },
      //'assets': {
      //  'files': ['assets/**/*'],
      //  'tasks': ['assets']
      //},
    },

    'cssmin': {
      'options': {
        'banner': defaultBanner,
        'report': 'min',
      },
      'build/css/main.css': 'build/css/main.css',
    },

    'uglify': {
      'options': {
        'banner': defaultBanner,
        'report': 'min',
      },
      'build/js/main.js': 'build/js/main.js',
    },

    'hashres': {
      'options': {},
      'deploy': {
        'src': [
          'build/js/index.js',
          'build/css/index.css',
        ],
        'dest': 'build/index.html',
      },
    },

    'gh-pages': {
      'deploy': {
        'options': {
          'base': 'build',
          'repo': 'https://github.com/wolfbiter/linx.git',
          'branch': 'gh-pages',
          'message': defaultBanner,
        },
        'src': ['**/*'],
      },
    },
  });
};