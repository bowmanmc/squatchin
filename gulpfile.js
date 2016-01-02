/**
 * squatchin
 */
var gulp        = require('gulp');
var browserSync = require('browser-sync');
var concat      = require('gulp-concat');
var cp          = require('child_process');
var debug       = require('gulp-debug');
var del         = require('del');
var execSync    = require('sync-exec');
var fs          = require('fs');
var imagemin    = require('gulp-imagemin');
var mbf         = require('main-bower-files');
var minifyCSS   = require('gulp-minify-css');
var moment      = require('moment');
var os          = require('os');
var path        = require('path');
var pkg         = require('./package.json');
var prefix      = require('gulp-autoprefixer');
var proxy       = require('proxy-middleware');
var rename      = require('gulp-rename');
var runSequence = require('run-sequence');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var uglify      = require('gulp-uglify');
var uncss       = require('gulp-uncss');
var url         = require('url');
var open        = require('gulp-open');
var wiredep     = require('wiredep').stream;


gulp.task('default', ['develop']);
gulp.task('build', ['sass', 'js', 'vendor']);

gulp.task('dist', function() {
    runSequence('build', 'makedist');
});


gulp.task('develop', function() {
    runSequence('build', ['watch', 'browser-sync']);
});

gulp.task('makedist', function() {
    del(['dist'], function() {
        fs.mkdirSync('dist');

        gulp.src('app/**/*')
            .pipe(gulp.dest('dist'));

        var ver = 'dist/version.txt';
        var now = moment();

        // get current git revision from git.
        // Requires 'git' command line!!
        var rev = 'Not Available';
        var branch = 'Not Available';
        try {
            rev = execSync('git rev-parse HEAD').stdout.trim();
            branch = execSync('git rev-parse --abbrev-ref HEAD').stdout.trim();
        }
        catch (err) {
            console.log('Error running "git rev-parse HEAD"');
            console.log('    ' + err.message);
        }

        fs.appendFileSync(ver, '\nsquatchin');
        fs.appendFileSync(ver, '\n===================');
        fs.appendFileSync(ver, '\nName: squatchin');
        fs.appendFileSync(ver, '\nDescription: Talk slides and code')
        fs.appendFileSync(ver, '\nURL: http://github.com/bowmanmc/squatchin');
        fs.appendFileSync(ver, '\nVersion: ' + pkg.version);
        fs.appendFileSync(ver, '\nGit Branch: ' + branch);
        fs.appendFileSync(ver, '\nGit Revision: ' + rev);
        fs.appendFileSync(ver, '\nBuild Time: ' + now.format('YYYY-MM-DD HH:mm:ss'));
        fs.appendFileSync(ver, '\nBuild Host: ' + os.hostname() + ' [' + os.platform() + ']');
        fs.appendFileSync(ver, '\n');
        fs.appendFileSync(ver, '\n');
    });
});

gulp.task('watch', function () {
    gulp.watch('app/styles/**/*.scss', ['sass']);
    gulp.watch('app/modules/**/*.js', ['js']);
    gulp.watch('bower.json', ['vendor']);
});

gulp.task('browser-sync', function() {
    browserSync({
        port: 9000,
        files: [
            'app/**/*.html',
            'app/**/*.js',
            'app/**/*.css',
            'app/fonts/*',
            'app/images/*'
        ],
        watchOptions: {
            ignoreInitial: true
        },
        server: {
            baseDir: 'app'
        }
    });
});

// Build sass into a single site.min.css
gulp.task('sass', function () {

    var bootstrap = 'app/bower_components/bootstrap-sass/assets/stylesheets';
    var fontawesome = 'app/bower_components/fontawesome/scss';

    return gulp.src('app/styles/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            onError: browserSync.notify,
            errLogToConsole: true,
            includePaths: [ bootstrap, fontawesome ]
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        //.pipe(minifyCSS())
        .pipe(rename('site.min.css'))
        .pipe(sourcemaps.write())
        //.pipe(debug())
        .pipe(gulp.dest('app/styles'));
});

// thanks @esvendsen !!!
gulp.task('vendor', ['vendor-js']);
gulp.task('vendor-js', function() {
    var jsRegex = (/.*\.js$/i);
    return gulp.src(mbf({ filter: jsRegex }))
        //.pipe(debug())
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.js'))
        //.pipe(gulp.dest('app/scripts'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/scripts'));
});

gulp.task('js', function() {
    return gulp.src('app/modules/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        //.pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/scripts'));
});
