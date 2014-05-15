module.exports = function(grunt) {
	grunt.mergeConfig = grunt.config.merge;
	
	require("./build/test.js")(grunt);
	
	grunt.loadNpmTasks('grunt-contrib-jasmine');
};