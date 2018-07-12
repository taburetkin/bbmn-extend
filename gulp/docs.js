import gulp from 'gulp';
import fs from 'fs';
import path from 'path';
import _ from 'underscore';
import gulpSequence from 'gulp-sequence';
import merge from 'merge-stream';
import concat from 'gulp-concat-util';
import del from 'del';

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

function processFolder(folderPath, level = 1, tasks = []) {
	tasks.push(
		gulp.src(folderPath + '/**/_README.md')
			.pipe(concat('README.md'))
			.pipe(gulp.dest(folderPath))
	);
	let subFolders = getFolders(folderPath);
	_(subFolders).each(subFolder => processFolder(folderPath + '/' + subFolder, level + 1, tasks));
	return tasks;
}


gulp.task('docs:clean', function(){
	return del(['README.md','src/**/README.md']);
});

gulp.task('docs:folders', ['docs:clean'], function(done) {
	let tasks = processFolder('src');	
	console.log('docs tasks: ', tasks.length);
	return merge(...tasks);
});

gulp.task('compile:docs',['docs:folders'], () => {
	return gulp.src(['./header.md', 'src/README.md'])
		.pipe(concat('README.md'))	
		.pipe(gulp.dest('./'));
});

gulp.task('docs', ['compile:docs'])
