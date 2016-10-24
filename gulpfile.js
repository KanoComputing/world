const gulp = require('gulp');
const PolymerProject = require('polymer-build').PolymerProject;
const mergeStream = require('merge-stream');

const project = new PolymerProject({
    root: './src',
    entrypoint: 'src/index.html',
    shell: 'src/elements/elements.html',
    fragments: [
        'src/elements/kw-view-projects/kw-view-projects.html'
    ]
});

gulp.task('t', () => {
    return mergeStream(project.sources(), project.dependencies())
        .pipe(project.analyzer)
        .pipe(project.bundler)
        .pipe(gulp.dest('www/'));
});
