import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import rollup from 'gulp-better-rollup';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import size from 'gulp-size';

let babelConfig = {
	presets: [['env', {modules: false}]],
	babelrc: false,		
	plugins: ['external-helpers']
}

let rollupConfig = {	
	plugins: [
		resolve({
			module:true,
		}),
		babel(babelConfig)
	]
}

function lib(){
	gulp.src('src/index.js')
    .pipe(sourcemaps.init())
    // note that UMD and IIFE format requires `name` but it will be inferred from the source file name `mylibrary.js`
    .pipe(rollup(rollupConfig, 'umd'))
    // save sourcemap as separate file (in the same folder)
	.pipe(sourcemaps.write(''))
	.pipe(size())
    .pipe(gulp.dest('lib'))
}

gulp.task('lib', lib);
