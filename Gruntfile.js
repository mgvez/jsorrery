'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;'+
      '*/',
    // Task configuration.
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['js/*.js'],
        dest: 'built/<%= pkg.name %>.concat.js'
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'built/<%= pkg.name %>.min.js'
      },
    },
    jshint: {
      js: {
        options: {
          jshintrc: 'js/.jshintrc',
          ignores : ['js/vendor/**/*.js']
        },
        src: ['js/**/*.js']
      }
    },
    watch: {
      less: {
        files: 'css/*.less',
        tasks: ['less']
      },
      js: {
        files: 'js/**/*.js',
        tasks: ['concat', 'uglify']
      }
    },
    less: {
      development: {
        options: {
          paths: [],
          compress : true
        },
        files: {
          "css/master.css": "css/master.less"
        }
      },
    },
    requirejs: {
      compile: {
        options: {
          
          skipDirOptimize: true,
          /*
          dir: "./js-build/",
          appDir: "./js/",
          appDir: "./",
          modules: [
              {
                  name: "app"
              }
          ],/**/
          //If you only intend to optimize a module (and its dependencies), with
          //a single file as the output, you can specify the module options inline,
          //instead of using the 'modules' section above. 'exclude',
          //'excludeShallow', 'include' and 'insertRequire' are all allowed as siblings
          //to name. The name of the optimized file is specified by 'out'.
          baseUrl: "./js/",
          name: "app",
          include: [],
          insertRequire: [],
          out: "js/app.built.js",
          
          mainConfigFile: 'js/app.js',
          done: function(done, output) {
            var duplicates = require('rjs-build-analysis').duplicates(output);

            if (duplicates.length > 0) {
              grunt.log.subhead('Duplicates found in requirejs build:');
              grunt.log.warn(duplicates);
              done(new Error('r.js built duplicate modules, please check the excludes option.'));
            }

            done();
          }
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
  grunt.registerTask('rjs', ['requirejs']);
  grunt.registerTask('deploy', ['requirejs']);

};
