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
    config: `<link rel="import" href="./config/${env}.html">`
};

function hasExt(ext) {
    return (file) => {
        return file.relative.split('.').pop() === ext;
    };
}

function isConfig (file) {
    return file.relative.indexOf('js/config.html');
}

gulp.task('copy', () => {
    return gulp.src([
            'src/assets/**/*',
            'src/css/**/*',
            'src/favicons/**/*',
            'src/index.html',
            'src/js/bootstrap.js',
            'src/manifest.json'
        ], { base: 'src' })
        .pipe($.if(isConfig, $.htmlReplace(htmlReplaceOptions)))
        .pipe(gulp.dest('www'));
});

gulp.task('shards', ['copy'], () => {
    return shards.build({
        shell: 'elements/elements.html',
        endpoints: [
            'elements/kw-view-projects/kw-view-projects.html',
            'elements/kw-view-feed/kw-view-feed.html'
        ],
        shared_import: 'elements/shared.html',
        root: 'src',
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
        .pipe($.if(hasExt('js'), compiler({
            compilationLevel: 'SIMPLE',
            outputWrapper: '(function(){\n%output%\n}).call(this)',
            jsOutputFile: 'output.min.js',
            polymerPass: true
        })))
        .pipe($.if(hasExt('js'), $.uglify()))
        .pipe(gulp.dest('www'));
});

gulp.task('polyfill', () => {
    gulp.src([
            'src/bower_components/webcomponentsjs/webcomponents-lite.min.js',
            'src/bower_components/es6-promise/es6-promise.js',
            'src/bower_components/fetch/fetch.js'
        ])
        .pipe($.uglify())
        .pipe(gulp.dest('www/vendor'));
});

gulp.task('build', () => {
    return runSequence('shards', 'polyfill', 'compress', 'sw');
});
