'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var WATCH_SCRIPTS = process.env.WATCH_SCRIPTS === 'true' ? true : false;
var watchify = require('watchify');

var bundleBrowserify = function (filePath) {
  var b = browserify(filePath, { debug: true })
    .on('error', gutil.log.bind(gutil, 'browserify Error'));
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'browserify Error'));
};

var bundleWatchify = function (filePath) {
  var b = browserify(filePath, { 
    cache: {},
    packageCache: {},
    fullPaths: true,
  });
  var w = watchify(b);
  w.on('update', function () {
    var filename = filePath.substring(filePath.lastIndexOf('/') + 1);
    return w.bundle()
      .pipe(source(filename))
      .pipe(gulp.dest('./public/scripts/dist/apps'))
      .on('error', gutil.log.bind(gutil, 'browserify Error'));
  });
  w.on('log', gutil.log);
  return w.bundle();
};

var bundles = function () {
  var cb = WATCH_SCRIPTS ? bundleWatchify : bundleBrowserify;
  return transform(cb);
};

gulp.task('browserify', function () {
  return gulp
    .src(['./public/scripts/src/apps/*.js'])
    .pipe(bundles())
    .pipe(gulp.dest('./public/scripts/dist/apps'))
    .on('error', gutil.log.bind(gutil, 'browserify Error'));
});

gulp.task('default', [
    'browserify',
  ]
);
