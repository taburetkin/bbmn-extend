import gulp from 'gulp';
import run from 'gulp-run-command';

gulp.task('server', run('http-server -p 81 -a bbmn.loc'));
