// Config for Require
require.config({
	baseUrl: 'js/lib',
	paths: {
		'app': '../app'
	},
	shim: {
		'jquery': {
			exports: 'jQuery'
		},
		'jquery.mobile-1.4.2' : {
        	deps : ['jquery'],
        	exports: 'jqm'
        },
        'jquery.geocodify': {
        	deps : ['jquery'],
        	exports: 'geocodify'
        },
		'leaflet': {
			exports: 'L'
		},
		'underscore': {
			exports: '_'
		},
		'handlebars': {
			exports: 'Handlebars'
		},
		'leaflet-providers' : ['leaflet'],
		'leaflet.awesome-markers' : ['leaflet-providers'],
		'leaflet-pip' : ['leaflet.awesome-markers'],
		'backbone': {
			deps: ['json2', 'underscore', 'jquery'],
			exports: 'Backbone'
		}
	}
});

// Load up necessary modules
// All contained in separate file
require(['domReady!'], function(doc){
	require(['../require-load'], function(){ });
});