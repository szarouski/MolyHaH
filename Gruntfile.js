/*jshint camelcase: false*/
// Generated on 2013-05-02 using generator-chrome-extension 0.1.1
'use strict';
const sass = require('node-sass');
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            coffee: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
                tasks: ['coffee:dist']
            },
            coffeeTest: {
                files: ['test/spec/{,*/}*.coffee'],
                tasks: ['coffee:test']
            },
            sass: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['copy:prepare', 'sass']
            },
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                'test/spec/{,*/}*.js'
            ]
        },
        coffee: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },
        sass: {
            options: {
                implementation: sass,
                sourceMap: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/styles',
                    src: ['*.scss'],
                    dest: '.tmp/styles',
                    ext: '.css'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: '<%= yeoman.dist %>/styles',
                src: '*.css',
                dest: '<%= yeoman.dist %>/styles'
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            prepare: {
                files: [{
                    // for import bootstrap
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/components',
                    dest: '.tmp/components',
                    src: [
                        '**/*.css'
                    ],
                    rename: function(dest, src){
                        var file = '_' + src.split('/').pop().replace('.css', '.scss');
                        var path = src.split('/').slice(0, -1).join('/');
                        return dest + '/' + path + '/' + file;
                    }
                }]
            },
            dist: {
                files: [{
                    // bootstrap's glyphicons-halflings
                    expand: true,
                    cwd: '<%= yeoman.app %>/components/bootstrap/img',
                    src: ['*.png'],
                    dest: '<%= yeoman.dist %>/img'
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        'images/{,*/}*.{webp,gif,png}',
                        '_locales/{,*/}*.json'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    dest: '<%= yeoman.dist %>/scripts',
                    src: [
                        '**/*.js'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '.tmp/scripts',
                    dest: '<%= yeoman.dist %>/scripts',
                    src: [
                        '**/*.js'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '.tmp/styles',
                    dest: '<%= yeoman.dist %>/styles',
                    src: [
                        '**/*.css'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/components',
                    dest: '<%= yeoman.dist %>/components',
                    src: [
                        '**/*.js'
                    ]
                }]
            }
        },
        concurrent: {
            server: [
                'coffee:dist',
                'sass'
            ],
            test: [
                'coffee',
                'sass'
            ],
            dist: [
                'coffee',
                'sass:dist',
                'svgmin',
                'htmlmin'
            ]
        },
        compress: {
            dist: {
                options: {
                    archive: 'package/Moly HaH.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            }
        }
    });

    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('eatwarnings', function() {
        grunt.warn = grunt.fail.warn = function(warning) {
            grunt.log.error(warning);
        };
    });

    grunt.registerTask('w', [
        'eatwarnings',
        'watch'
    ]);

    grunt.registerTask('manifest', function() {
        var manifest = grunt.file.readJSON(yeomanConfig.app + '/manifest.json');
        grunt.file.write(yeomanConfig.dist + '/manifest.json', JSON.stringify(manifest, null, 2));
    });

//    grunt.registerTask('test', [
//        'clean:server',
//        'concurrent:test',
//        'connect:test',
//        'mocha'
//    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'copy:prepare',
        'concurrent:dist',
        'copy:dist',
        'cssmin',
        'manifest',
        'compress'
    ]);

    grunt.registerTask('default', [
        'jshint',
//        'test',
        'build'
    ]);
};
