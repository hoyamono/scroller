var gulp = require('gulp'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	babel = require('gulp-babel'),
	uglify = require('gulp-uglify');


gulp.task('sass', function () {
	return gulp.src('./src/scss/*.scss')
		.pipe(sass({
			outputStyle: 'compact'
		}).on('error', sass.logError))
		// .pipe(concat('main.css'))
		.pipe(gulp.dest('./resouces/css'))
});

gulp.task('sass:watch', function () {
	return gulp.watch('./src/scss/*.scss', gulp.series('sass'));
});

gulp.task('js-build', function () {
	return gulp.src('./src/js/*.js')
	.pipe(babel())
	.pipe(uglify())
	.pipe(concat('scroller.min.js'))
	.pipe(gulp.dest('./resouces/js'))
});

gulp.task('default', gulp.series('sass', 'js-build'));