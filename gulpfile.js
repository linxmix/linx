var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var less = require('gulp-less');
var refresh = require('gulp-livereload');
var lr = require('tiny-lr');
var server = lr();

gulp.task('js-build', function () {
  return browserify('./')
    .transform({
      global: true,
    }, 'uglifyify')
    .bundle()
    .pipe(source('index.js'))
    .pipe(gulp.dest('./static'))
});

gulp.task('js-watch', function () {
  var bundler = watchify('./')
  var rebundle = function () {
    return bundler.bundle({ debug: true })
    .pipe(source('index.js'))
    .pipe(gulp.dest('./static'))
    .pipe(refresh(server));
  }
  bundler.on('update', rebundle);
  return rebundle();
});

gulp.task('css-watch', function () {
  return gulp.src('./client/index.less')
    .pipe(less())
    .pipe(gulp.dest('static'))
    .pipe(refresh(server));
});

gulp.task('css-build', function () {
  return gulp.src('./client/index.less')
    .pipe(less({
      compress: true
    }))
    .pipe(gulp.dest('static'))
});
 
gulp.task('lr-server', function (cb) {
  server.listen(35729, cb);
});
 
gulp.task('watch', function () {
  gulp.watch('./client/**/*.less', ['css-watch']);
});

gulp.task('develop', ['lr-server', 'js-watch', 'css-watch', 'watch']);

gulp.task('default', ['js-build', 'css-build']);
