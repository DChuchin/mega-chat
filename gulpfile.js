var
    gulp         = require('gulp'),
    autoprefixer = require('autoprefixer'),
    postcss      = require('gulp-postcss'),
    precss       = require('precss'),
    plumber      = require('gulp-plumber'),
    browserSync  = require('browser-sync').create();

gulp.task('sync', function() {
    browserSync.init({
        server: {
            baseDir: './',
            tunnel: true
        }
    })
});

gulp.task('style', function () {
    var processors = [
            precss(),
            autoprefixer({browsers : [ '> 1%', 'last 2 versions']})
    ];
    gulp.src('dist/**/*.css')
        .pipe(plumber())
        .pipe(postcss(processors))
        .pipe(gulp.dest('./'))    
});

gulp.task('watch', function() {
    gulp.watch('dist/**/*.css', ['style']);
    gulp.watch(['*.html', '*.css', '*.js']).on('change', browserSync.reload);
});

gulp.task('default', ['style', 'watch', 'sync']);