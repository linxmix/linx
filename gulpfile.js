var gulp = require('gulp');
var replace = require('gulp-replace');
var deploy = require('gulp-gh-pages');

gulp.task('fonts', function () {
  return gulp.src(['./node_modules/semantic/src/fonts/*'])
    .pipe(gulp.dest('./static/fonts/'));
});

gulp.task('deploy', function () {
  return gulp.src("./static/**/*")
    .pipe(replace('    <script src="/-/live-reload.js"></script>\n',''))
    .pipe(deploy({
      remoteUrl: "git@github.com/linxmix/linxmix.github.io",
      origin: "deploy",
      branch: "master"
    }));
});

gulp.task('assets', ['fonts'])
gulp.task('default', ['assets']);
gulp.task('deploy', ['deploy']);
