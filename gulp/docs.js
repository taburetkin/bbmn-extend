import gulp from 'gulp';
import fs from 'fs';
import path from 'path';
import _ from 'underscore';
import gulpSequence from 'gulp-sequence';
import merge from 'merge-stream';
import concat from 'gulp-concat-util';
import del from 'del';

let rootPath = path.join('src');

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

function toRelative(filePath, skipFile){
	let fp = path.relative('src', filePath);
	let chunks = fp.split(/\/|\\/);
	if(skipFile) chunks.pop();
	return chunks.join('/');
}

function processFolder(folderPath, level = 1, tasks = []) {
	let normalizedFolder = folderPath.split('/');
	normalizedFolder.shift();
	normalizedFolder = normalizedFolder.join('/');
	tasks.push(
		gulp.src(folderPath + '/**/_README.md')
			.pipe(concat('README.md', {process: function(src, filePath){
				let dirPath = toRelative(filePath, true);
				//let rootHeader = normalizedFolder != dirPath && '# ' + normalizedFolder + '\r\n' || '';
				let header = '## ' + dirPath + '\r\n';
				//console.log(normalizedFolder, ',' , relativePath);
				return header + src;
			}}))
			// .pipe(concat('README.md', { process: function(src, filePath){
			// 	let dirPath = toRelative(filePath, true);
			// 	console.log('~', dirPath, '	', normalizedFolder);
			// 	return src;
			// }}))
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
