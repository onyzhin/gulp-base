'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    fileinclude = require('gulp-file-include'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    concat = require('gulp-concat'),
    bowerMain = require('bower-main'),
    wiredep = require('wiredep').stream,
    gutil = require('gulp-util');

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        style: 'build/css/',
        img: 'build/images/',
        fonts: 'build/fonts/'
    },
    src: {
        html:{
            file:'app/*.html',
            template:'app/templates'
        },
        js: 'app/js/**/*.js',
        style:'app/scss/main.scss',
        img: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    watch: {
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        style: 'app/scss/**/*.scss',
        img: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*',        
        bower: 'app/bower_components/**/*.*' 
    },
    clean: './build',
};

var config = {
    server: {
        baseDir: "./" 
    },
    tunnel: true,
    host: 'localhost',
    port: 9080,
    logPrefix: "gulp-front-end"
};


gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html.file)
        .pipe(fileinclude({ 
          prefix: '@@',
          basepath: path.src.html.template
        }))  
        .pipe(wiredep({
          optional: 'configuration',
          goes: 'here'
        }))
        .pipe(gulp.dest(path.build.html))   
        .pipe(reload({stream: true}));     
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) 
        .pipe(sourcemaps.init()) 
        .pipe(uglify()) 
        .pipe(sourcemaps.write())  
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
}); 

gulp.task('style:build', function () {
    gulp.src(path.src.style) 
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.style))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) 
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        })) 
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'js:build',
    'style:build',
    'html:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.bower], function(event, cb) {
        gulp.start('html:build');
    });
});


gulp.task('default', ['build','webserver', 'watch']); 