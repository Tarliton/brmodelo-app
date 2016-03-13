var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var server = require('gulp-express');

//Sass variables
var input = './app/sass/*.scss';
var output = './app/css/';
var sassOptions = {
	errLogToConsole: true,
	outputStyle: 'expanded'
};

gulp.task('sass', function () {
	return gulp
	.src(input)
	.pipe(sourcemaps.init())
	.pipe(sass(sassOptions).on('error', sass.logError))
	.pipe(sourcemaps.write())
	.pipe(autoprefixer())
	.pipe(gulp.dest(output))
});//End task sass

gulp.task('watch', function() {
	return gulp
	.watch(input, ['sass'])
	.on('change', function(event) {
	console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
});//End tastk watch

gulp.task('copy', function() {
	gulp.src([
		'node_modules/angular-ui-bootstrap/ui-bootstrap.js',
		'node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.min.js',
		'node_modules/angular-modal-service/dst/angular-modal-service.min.js',
		'node_modules/angular-modal-service/dst/angular-modal-service.min.js.map',
		'node_modules/angular/angular.min.js',
		'node_modules/angular/angular.min.js.map',
		'node_modules/angular-ui-router/release/angular-ui-router.min.js',
		'node_modules/angular-cookies/angular-cookies.min.js',
		'node_modules/angular-cookies/angular-cookies.min.js.map',
		'bower_components/angular-ui-select3/src/select3.js'
	]).pipe(gulp.dest('build/libs/'));

	gulp.src([
		'node_modules/bootstrap/dist/**/*'
	]).pipe(gulp.dest('build/bootstrap'));

	gulp.src([
		'bower_components/jquery-nice-select/**/*'
	]).pipe(gulp.dest('build/jquery-nice-select'));

});//End task copy

gulp.task('server', function () {
	server.run(['server.js']);
});//End task server

gulp.task('default', ['sass','watch','copy','server']);