import gulp from 'gulp';
import concat from 'gulp-concat-util';
import del from 'del';
import _ from 'underscore';
import gulpSequence from 'gulp-sequence';

const folders = ['mixins','utils'];
const getFolderTask = folder => `docs:folder:${folder}`;
const foldersTasks = _(folders).map(getFolderTask);

function clean()
{
	let readmes = _(folders).map(folder => `src/${folder}/README.md`);
	readmes.push('src/README.md');
	return del(readmes);
}
gulp.task('clean:docs', clean);

_(folders).each(folder => {
	gulp.task(getFolderTask(folder), function(){ return buildFolder(folder); });
});


function buildFolder(folder){
	return gulp.src(`src/${folder}/**/README.md`)
		.pipe(concat('README.md'))
		.pipe(concat.header(`# ${folder} \r\n`))
		.pipe(gulp.dest(`src/${folder}`));
}

gulp.task('concat:docs', function(){
	let paths = _(folders).map(folder => `src/${folder}/README.md`);
	return gulp.src(paths)
		.pipe(concat('README.md'))	
		.pipe(gulp.dest('src/'));
});

gulp.task('compile:docs',() => {
	return gulp.src(['./header.md', 'src/README.md'])
		.pipe(concat('README.md'))	
		.pipe(gulp.dest('./'));
});

gulp.task('docs', gulpSequence('clean:docs', foldersTasks, 'concat:docs', 'compile:docs'));
