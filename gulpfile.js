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
    config: `<link rel="import" href="./config/${env}.html">\n`,
    path: `<meta name="path-prefix" data-value="/new/">`
};

function hasExt(ext) {
    return (file) => {
        return file.relative.split('.').pop() === ext;
    };
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
    return gulp.src(['.tmp/js/config.html', '.tmp/index.html'], { base: '.tmp' })
        .pipe($.htmlReplace(htmlReplaceOptions))
        .pipe(gulp.dest('.tmp/'));
});

gulp.task('shards', () => {
    return shards.build({
        shell: 'elements/elements.html',
        endpoints: [
            'elements/kw-view-welcome/kw-view-welcome.html',
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
    return gulp.src(['www/index.html', 'www/elements/**/*.html', 'www/assets/**/*.json'], { base: 'www' })
        .pipe($.if(hasExt('html'), $.crisper({ scriptInHead: false })))
        .pipe($.replace(/<(.+)(href|src|assets-path|path|content)="\/(.+)"(.*)>/g, '<$1$2="/new/$3"$4>'))
        .pipe($.replace('url("/assets', 'url("/new/assets'))
        .pipe($.replace('["/', '["/new/'))
        .pipe($.if(hasExt('json'), $.replace('"/assets', '"/new/assets')))
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

gulp.task('rewrite-sw', () => {
    return gulp.src(['www/sw.js'], { base: 'www' })
        .pipe($.replace('["/', '["/new/'))
        .pipe($.uglify())
        .pipe(gulp.dest('www'));
});

gulp.task('build', () => {
    return runSequence('move-to-tmp', 'config', 'copy', 'shards', 'polyfill', 'compress', 'sw', 'rewrite-sw');
});
