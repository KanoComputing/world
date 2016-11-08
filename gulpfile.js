const gulp = require('gulp');
const PolymerProject = require('polymer-build').PolymerProject;
const mergeStream = require('merge-stream');
const $ = require('gulp-load-plugins')();
const shards = require('./tasks/shards');
const runSequence = require('run-sequence');
const compiler = require('google-closure-compiler-js').gulp();
const env = process.env.NODE_ENV || 'development';
const url = require('url');
const fs = require('fs');
const browserSync = require('browser-sync');

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

gulp.task('watch', function() {
    browserSync.init({
        server: {
            baseDir: "./src",
            middleware: function(req, res, next) {
                var fileName = url.parse(req.url);
                fileName = fileName.href.split(fileName.search).join("");
                var fileExists = fs.existsSync('src' + fileName);
                if (!fileExists && fileName.indexOf("browser-sync-client") < 0) {
                    req.url = "/index.html";
                }
                return next();
            }
        },
        port: 7000,
        open: false
    });
    return gulp.watch('./src/**/*')
        .on('change', (e) => {
            browserSync.reload();
        });
});

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
        // All theses are to support redirection and navigation through the previous version of Kano World 
        .pipe($.replace(/<([^a])(.+)(href|src|assets-path|path|content|image)="\/(.+)"(.*)>/g, '<$1$2$3="/new/$4"$5>'))
        .pipe($.replace('url("/assets', 'url("/new/assets'))
        .pipe($.replace('["/', '["/new/'))
        .pipe($.if(hasExt('json'), $.replace('"/assets', '"/new/assets')))
        // End
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

gulp.task('safari-9-support', () => {
    gulp.src(['www/elements/**/*.js', 'www/vendor/es6-promise/**/*', 'www/vendor/fetch/**/*'], { base: 'www' })
        .pipe($.replace(/("|')use strict("|');/, ''))
        .pipe(gulp.dest('www'));
});

gulp.task('build', () => {
    return runSequence('move-to-tmp', 'config', 'copy', 'shards', 'polyfill', 'compress', 'safari-9-support', 'sw', 'rewrite-sw');
});
