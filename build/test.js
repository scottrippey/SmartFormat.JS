module.exports = function(grunt) {
	grunt.registerTask('test', [ 'jasmine' ]);
	
	grunt.mergeConfig({
		jasmine: {
			'ALL-TESTS': {
				src: [ 'src/**/*.js' ]
				, options: {
					specs: [ 'test/**/*.js' ]
				}
			}
		}
	});
};