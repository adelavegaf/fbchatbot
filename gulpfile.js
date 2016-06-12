var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    browserSync = require('browser-sync'),
    ngannotate = require('gulp-ng-annotate'),
    del = require('del');

gulp.task('jshint', function () {
    return gulp.src('./scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

// Clean
gulp.task('clean', function () {
    return del(['dist']);
});

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('usemin', 'imagemin', 'copyfonts', 'copyviews');
});

gulp.task('usemin', ['jshint'], function () {
    return gulp.src('./views/index.html')
        .pipe(usemin({
            libcss: ['concat', rev()],
            css: [minifycss(), rev()],
            libjs: ['concat', rev()],
            js: [ngannotate(), uglify(), rev()]
        }))
        .pipe(gulp.dest('dist/'));
});

// Images
gulp.task('imagemin', function () {
    return del(['dist/images']), gulp.src('./images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({
            message: 'Images task complete'
        }));
});

gulp.task('copyfonts', ['clean'], function () {
    gulp.src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./dist/fonts'));
    gulp.src('./bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./dist/fonts'));
    gulp.src('./fonts/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('copyviews', ['clean'], function () {
    gulp.src(['./views/*.html', '!./views/index.html'])
        .pipe(gulp.dest('./dist/views'));
});

// Watch
gulp.task('watch', ['browser-sync'], function () {
    // Watch .js files
    gulp.watch('{./scripts/**/*.js,./styles/**/*.css,./**/*.html}', ['usemin']);
    // Watch image files
    gulp.watch('./images/**/*', ['imagemin']);

});

gulp.task('browser-sync', ['default'], function () {
    var files = [
      './**/*.html',
      './styles/**/*.css',
      './images/**/*.png',
      './scripts/**/*.js',
      'dist/**/*'
   ];

    browserSync.init(files, {
        server: {
            baseDir: "dist",
            index: "index.html"
        }
    });
    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**']).on('change', browserSync.reload);
});
