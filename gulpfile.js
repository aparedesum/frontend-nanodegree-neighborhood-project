var gulp = require("gulp");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");
var minifyCss = require('gulp-minify-css');

gulp.task("scripts", function(){
	gulp.src(["js/model.js","js/app.js"])
	.pipe(concat("app.min.js"))
	.pipe(uglify())
	.pipe(gulp.dest("js/min/"));
});

gulp.task('minify-css', function() {
  	gulp.src('css/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(concat("style.min.css"))
    .pipe(gulp.dest('css/min'));
});