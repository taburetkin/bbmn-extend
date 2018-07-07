import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import rollup from 'gulp-rollup';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import size from 'gulp-size';

let babelConfig = {
	presets: [['env', { modules: false }]],
	babelrc: false,
	plugins: ['external-helpers']
}

let rollupGlobals = {
	'backbone': 'Backbone',
	'backbone.marionette': 'Mn',
	'jquery': '$',
	'underscore': '_',
}

let rollupConfig = {
	allowRealFiles: true,
	plugins: [
		resolve({
			module: true,
		}),
		babel(babelConfig)
	],
	external: ['backbone', 'backbone.marionette', 'underscore'],
	output: {
		format: 'umd',
		name: 'bbmn',
		'globals': rollupGlobals
	},
	input:'src/index.js'
};

function lib() {
	gulp.src('src/index.js')
		.pipe(sourcemaps.init())
		// note that UMD and IIFE format requires `name` but it will be inferred from the source file name `mylibrary.js`
		.pipe(rollup(rollupConfig, 'es'))
		// save sourcemap as separate file (in the same folder)
		.pipe(sourcemaps.write(''))
		.pipe(size())
		.pipe(gulp.dest('lib'));
}

gulp.task('lib', lib);
