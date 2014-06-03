// Generated using generator-courier 0.1.3
'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        // configurable paths
        yeoman: {
            app: 'app',
            dist: 'ia-mental-health-public'
        },
        // Sass conversion with Compass
        compass: {
            dev: {
                options: {
                    sassDir: '<%= yeoman.app %>/scss',
                    cssDir: '<%= yeoman.app %>/css'
                }
            }
        },
        // Live reload of localhost; Sass conversion
        watch: {
            options: {
                nospawn: true,
                livereload: LIVERELOAD_PORT
            },
            livereload: {
                files: [
                    '<%= yeoman.app %>/index.html',
                    '<%= yeoman.app %>/iframe.html',
                    '<%= yeoman.app %>/*',
                    '<%= yeoman.app %>/css/*',
                    '<%= yeoman.app %>/css/lib/*',
                    '<%= yeoman.app %>/scss/*',
                    '<%= yeoman.app %>/js/*',
                    '<%= yeoman.app %>/js/app/*',
                    '<%= yeoman.app %>/js/lib/*',
                    '<%= yeoman.app %>/json/*'
                ]
            },
            sass: {
                files: ['<%= yeoman.app %>/scss/*'],
                tasks: ['compass:dev']
            }
        },
        // Copy bower components when scaffolding app
        bowercopy: {
            basecss: {
                options: {
                    destPrefix: '<%= yeoman.app %>/css/lib/'
                },
                files: {
                    'bootstrap-responsive.css': 'bootstrap/docs/assets/css/bootstrap-responsive.css',
                    'bootstrap.css': 'bootstrap/docs/assets/css/bootstrap.css',
                    'font-awesome.css': 'font-awesome/css/font-awesome.css',
                    'font-awesome-ie7.min.css': 'font-awesome/css/font-awesome-ie7.min.css',
                    'leaflet.css': 'leaflet-dist/leaflet.css'
                }
            },
            leafletdefaultmarkers: {
                files: {
                    '<%= yeoman.app %>/css/images': 'leaflet-dist/images'
                }
            },
            dataTablesimages: {
                files: {
                    '<%= yeoman.app %>/css/lib/images': 'datatables/media/images'
                }
            },
            font: {
                options: {
                    destPrefix: '<%= yeoman.app %>/css/'
                },
                files: {
                    'font': 'font-awesome/font'
                }
            },
            basejs: {
                options: {
                    destPrefix: '<%= yeoman.app %>/js/lib/'
                },
                files: {
                    'jquery.js': 'jquery/dist/jquery.js',
                    'async.js': 'requirejs-plugins/src/async.js',
                    'leaflet.js': 'leaflet-dist/leaflet.js',
                    'leaflet-providers.js': 'leaflet-providers/leaflet-providers.js',
                    'leaflet.awesome-markers.js': 'Leaflet.awesome-markers/dist/leaflet.awesome-markers.js',
                    'jquery.dataTables.js': 'datatables/media/js/jquery.dataTables.js',
                    'handlebars.js': 'handlebars/handlebars.js',
                    'json2.js': 'json/json2.js',
                    'underscore.js': 'underscore/underscore.js',
                    'backbone.js': 'backbone/backbone.js'
                }
            },
            requirejs: {
                options: {
                    destPrefix: '<%= yeoman.app %>/js/'
                },
                files: {
                    'require.js': 'requirejs/require.js'
                }
            }
        },
        // Prep our HTML, CSS files and send to public directory
        copy: {
            index: {
                src: '<%= yeoman.app %>/index.html',
                dest: '<%= yeoman.dist %>/index.html'
            },
            iframe: {
                src: '<%= yeoman.app %>/iframe.html',
                dest: '<%= yeoman.dist %>/iframe.html'
            },
            imgs: {
                expand: true,
                flatten: true,
                src: ['<%= yeoman.app %>/imgs/**'],
                dest: '<%= yeoman.dist %>/imgs/',
                filter: 'isFile'
            },
            font: {
                expand: true,
                flatten: true,
                src: ['<%= yeoman.app %>/css/font/**'],
                dest: '<%= yeoman.dist %>/font/',
                filter: 'isFile'
            },
            data: {
                expand: true,
                flatten: true,
                src: ['<%= yeoman.app %>/data/**'],
                dest: '<%= yeoman.dist %>/data/',
                filter: 'isFile'
            },
            spin: {
                src: '<%= yeoman.app %>/js/spin_custom.js',
                dest: '<%= yeoman.dist %>/js/spin_custom.js'
            },
            json: {
                expand: true,
                flatten: true,
                src: ['<%= yeoman.app %>/json/**'],
                dest: '<%= yeoman.dist %>/json/',
                filter: 'isFile'
            },
            csslibimages: {
                expand: true,
                flatten: true,
                src: ['<%= yeoman.app %>/css/lib/images/*'],
                dest: '<%= yeoman.dist %>/css/images/',
                filter: 'isFile'
            },
            jqmiconspng: {
                expand: true,
                flatten: true,
                src: ['<%= yeoman.app %>/css/lib/images/icons-png/**'],
                dest: '<%= yeoman.dist %>/css/images/icons-png',
                filter: 'isFile'
            },
            jqmiconssvg: {
                expand: true,
                flatten: true,
                src: ['<%= yeoman.app %>/css/lib/images/icons-svg/**'],
                dest: '<%= yeoman.dist %>/css/images/icons-svg',
                filter: 'isFile'
            },
            cssimages: {
                expand: true,
                flatten: true,
                src: ['<%= yeoman.app %>/css/images/**'],
                dest: '<%= yeoman.dist %>/css/images/',
                filter: 'isFile'
            }
        },
        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: [ '<%= yeoman.dist %>/index.html' ]
        },
        // Uglify JS files and send to public directory
        requirejs: {
            compile: {
                options: {
                    paths: {
                        'require': '../require',
                        'script': '../app/script',
                        'load-map': '../app/load-map',
                        'load-datatables': '../app/load-datatables',
                        'load-json': '../app/load-json'
                    },
                    modules: [
                        {
                            name: 'script',
                            include: [
                                'script',
                                'load-map',
                                'load-datatables',
                                'load-json'
                            ]
                        }
                    ],
                    baseUrl: '<%= yeoman.app %>/js/lib',
                    mainConfigFile: "<%= yeoman.app %>/js/config.js",
                    dir: '<%= yeoman.dist %>/js/'
                }
            }
        },
        // Wrap our config.js file with call to min script.js
        // For public only
        wrap: {
            basic: {
                src: ['<%= yeoman.app %>/js/require-load.js'],
                dest: '<%= yeoman.dist %>/js/config.js',
                options: {
                    wrapper: ['require(["domReady!"], function(doc){\nrequire(["script"], function(script){\n', '\n});\n});']
                }
            }
        },
        // Connect to localhost
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: '*'
                },
                livereload: {
                    options: {
                        middleware: function (connect) {
                            return [
                                lrSnippet,
                                mountFolder(connect, '.')
                            ];
                        }
                    }
                }
            }
        },
        // Open local host
        open: {
            app: {
                path: 'http://localhost:<%= connect.server.options.port %>/<%= yeoman.app %>',
                app: 'Google Chrome'
            },
            dist: {
                path: 'http://localhost:<%= connect.server.options.port %>/<%= yeoman.dist %>',
                app: 'Google Chrome'
            },
            deployed: {
                path: 'http://wcfcourier.com/app/special/<%= yeoman.dist %>',
                app: 'Google Chrome'
            }
        },
        // Unit tests
        mochaTest: {
            test: {
                src: ['test/*.js']
            }
        },
        // Deploy to FTP server
        'sftp-deploy': {
            build: {
                auth: {
                    host: 'sftp.wcfcourier.com',
                    port: 122,
                    authKey: 'courierKey'
                },
                src: '<%= yeoman.dist %>',
                dest: '/special/<%= yeoman.dist %>'
            }
        }
    });

    // Grunt task to run it all
    grunt.registerTask('app', [
        'bowercopy:basecss',
        'bowercopy:leafletdefaultmarkers',
        'bowercopy:dataTablesimages',
        'bowercopy:font',
        'bowercopy:basejs',
        'bowercopy:requirejs',
        'compass:dev',
        'connect:server:llivereload',
        'open:app',
        'watch'
    ]);
    grunt.registerTask('server', [
        'compass:dev',
        'connect:server:livereload',
        'open:app',
        'watch'
    ]);
    grunt.registerTask('public', [
        'copy:index',
        'copy:iframe',
        'copy:imgs',
        'copy:font',
        'copy:data',
        'copy:json',
        'copy:csslibimages',
        'copy:jqmiconspng',
        'copy:jqmiconssvg',
        'copy:cssimages',
        'useminPrepare',
        'concat',
        'cssmin',
        'usemin',
        'requirejs',
        'wrap',
        'copy:spin',
        'connect:server:llivereload',
        'open:dist',
        'watch'
    ]);
    
    grunt.registerTask('deploy', [
        'sftp-deploy',
        'open:deployed'
    ]);
};
