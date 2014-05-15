var gulp = require('gulp');

gulp.task('fonts', function () {
  return gulp.src(['./node_modules/semantic/src/fonts/*'])
    .pipe(gulp.dest('./static/fonts/'));
});

gulp.task('default', ['fonts']);
