import gulp from 'gulp';
import mocha from 'gulp-mocha';

const mochaGlobals = ['stub', 'spy', 'expect', 'Mn'];

function _mocha(setupFile) {
	//require('babel-register');
	return gulp.src(
		[setupFile,'test/unit/utils/is-known-ctor.js'], //[setupFile, 'test/unit/**/*.js'],
		{read: false}
	)
		.pipe(mocha({
			reporter: 'dot',
			globals: mochaGlobals,
			ignoreLeaks: false,
			//compilers:'js:babel-core/register',
			require:'babel-core/register'
		}));
}

function _registerBabel() {
	require('babel-register');
}

function test() {
	//_registerBabel();
	return _mocha('test/setup/node.js');
}

gulp.task('test', test);