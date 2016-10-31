const gulp = require('gulp');
const PolymerProject = require('polymer-build').PolymerProject;
const mergeStream = require('merge-stream');
const $ = require('gulp-load-plugins')();
const shards = require('./tasks/shards');
const runSequence = require('run-sequence');
const compiler = require('google-closure-compiler-js').gulp();
const env = process.env.NODE_ENV || 'development';

$.cssSlam = require('css-slam').gulp;

require('./tasks/sw')(gulp, $);

const htmlReplaceOptions = {
    config: `<link rel="import" href="./config/${env}.html">\n`
};

function hasExt(ext) {
    return (file) => {
        return file.relative.split('.').pop() === ext;
    };
}

function isConfig (file) {
    return file.relative.indexOf('js/config.html');
}

// Move the whole src folder to .tmp. This ensures that the src folder will not be touched
gulp.task('move-to-tmp', () => {
    return gulp.src('src/**/*', { base: 'src' })
        .pipe(gulp.dest('.tmp'));
});

gulp.task('copy', () => {
    return gulp.src([
            '.tmp/assets/**/*',
            '.tmp/css/**/*',
            '.tmp/favicons/**/*',
            '.tmp/index.html',
            '.tmp/js/bootstrap.js',
            '.tmp/manifest.json'
        ], { base: '.tmp' })
        .pipe(gulp.dest('www'));
});

gulp.task('config', () => {
    return gulp.src('.tmp/js/config.html', { base: '.tmp' })
        .pipe($.htmlReplace(htmlReplaceOptions))
        .pipe(gulp.dest('.tmp/'));
});

gulp.task('shards', () => {
    return shards.build({
        shell: 'elements/elements.html',
        endpoints: [
            'elements/kw-view-projects/kw-view-projects.html',
            'elements/kw-view-feed/kw-view-feed.html',
            'elements/kw-auth-modal/kw-auth-modal.html'
        ],
        shared_import: 'elements/shared.html',
        root: '.tmp',
        dest: 'www'
    });
});

gulp.task('compress', () => {
    return gulp.src(['www/elements/**/*.html'], { base: 'www' })
        .pipe($.crisper({ scriptInHead: false }))
        .pipe($.if(hasExt('html'), $.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            removeComments: true
        })))
        .pipe($.if(hasExt('css'), $.cssSlam()))
        .pipe($.if(hasExt('js'), $.babel({ presets: ['es2015'] })))
        .pipe($.if(hasExt('js'), $.uglify()))
        .pipe(gulp.dest('www'));
});

gulp.task('polyfill', () => {
    return gulp.src([
            '.tmp/bower_components/webcomponentsjs/webcomponents-lite.min.js',
            '.tmp/bower_components/es6-promise/es6-promise.js',
            '.tmp/bower_components/fetch/fetch.js'
        ])
        .pipe($.uglify())
        .pipe(gulp.dest('www/vendor'));
});

gulp.task('build', () => {
    return runSequence('move-to-tmp', 'copy', 'config', 'shards', 'polyfill', 'compress', 'sw');
});
