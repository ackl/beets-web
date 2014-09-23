var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var gulp = require('gulp');
var karma = require('karma').server;
var watchify = require('watchify');

//default gulp task browserifies application js files in bundle and minifies js
gulp.task('default', function() {
  var bundleStream = browserify('./static/js/app.js').bundle()
  bundleStream
    .pipe(source('bundle.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./static/'))
});

//this task watches for changes application js files and compiles them
gulp.task('watch', function(){
	watch = true;
  browserifySetup('./static/js/app.js', 'bundle.js', './static/');
});


function browserifySetup(inputFile, outputFile, outputPath){
  //need to pass these three config options to browserify
  var b = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true
  });
  //use watchify is watch flag set to true
  if (watch) {
	  //wrap watchify around browserify
	  b = watchify(b);

	  //compile the files when there is a change saved
	  b.on('update', function(){
	    buildFiles(b, outputFile, outputPath);
	  });
  }

  b.add(inputFile);
  buildFiles(b, outputFile, outputPath);
}

function buildFiles(b, outputFile, outputPath) {
  b.bundle()
    .on('error', function(err){
        console.log(err.message);
        this.end();
      })
    .pipe(source(outputFile))
    .pipe(gulp.dest(outputPath));
}