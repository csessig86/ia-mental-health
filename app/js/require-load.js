// Map options load
require([
	'backbone',
	'app/load-map',
	'jquery.mobile-1.4.2',
	'twitter-widgets'
], function(Backbone, map, jqm, twitter){
	/* jQuery mobile settings */
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.disablePageZoom = true;
    $.mobile.defaultPageTransition = 'none';

    // First map load
	map.baseMap();
	map.geoJSON();

	// Second map load
	map.baseMapTwo();
	map.geoJSONTwo();
	map.resetZoom();
	map.legendTableView();
	map.loadJSON();
	map.removeJSON();
	map.hideShowTables();

	// Geocode load
	require([
    	'async!http://maps.google.com/maps/api/js?sensor=false'
	], function() {
		map.geocode();
	});

	// Hash navigation
	AppRouter = Backbone.Router.extend({
		routes: {
			"": "home",
			"home": "home",
			"second": "second",
			"map": "fullScreenMap",
			"services": "openServices",
			"servicesclose": "closeServices",
			"showlegend": "showLegend",
			"hidelegend": "hideLegend"
		},

		// Toggles first page stuff
		homeShow: function(yes_no) {
			if (yes_no === "yes") {
				$('.page-one-content').show();
			} else {
				$('.page-one-content').hide();
			}
			return this;
		},

		// Toggles second page stuff
		secondPageShow: function(yes_no) {
			if (yes_no === "yes") {
				$('.page-two-content').show();
			} else {
				$('.page-two-content').hide();
			}
			return this;
		},

		// Full screen map for last page
		fullScreenMapShow: function(yes_no) {
			if (yes_no === "yes") {
				$('.pages-content').hide();

				// Map options
				$('.geocoder_box_one').show();
				$('.leaflet-control-container').show();
				$('.page-three-content').show();
			} else {
				$('.pages-content').show();

				// Map options
				$('.geocoder_box_one').hide();
				$('.leaflet-control-container').hide();
				$('.page-three-content').hide();
			}
			return this;
		},

		// First page
		home: function() {
            this.secondPageShow("no");
			this.fullScreenMapShow("no");

			this.homeShow("yes");
		},

		// Second page
		second: function() {
			this.homeShow("no");
			this.fullScreenMapShow("no");

			this.secondPageShow("yes");

			// Clear values of geocoders
			map.clearGeocoders();
		},

		// Full screen map page
		fullScreenMap: function() {
			this.homeShow("no");
			this.secondPageShow("no");

			this.fullScreenMapShow("yes");

			// Resets map size when hiding, showing DIVs
			map.mapInvalidateSize();

			// Clear values of geocoders
			map.clearGeocoders();
		},

		// Open, close services dropdown
		// For each point on marker
		// For mobile only
		openServices: function() {
			$('.servicesopen-icon').hide();
			$('.popup_services_header').show();
			$('.popup_individual_services').show();
			$('.servicesclose-icon').show();
		},
		closeServices: function() {
			$('.servicesclose-icon').hide();
			$('.popup_services_header').hide();
			$('.popup_individual_services').hide();
			$('.servicesopen-icon').show();
		},

		// Hides, shows legend on mobile
		showLegend: function() {
			$('.showlegend-icon').hide();
			$('#mobile-hide-show').show();
			$('.hidelegend-icon').show();
			$('#legend-text').show();
			$('#legend').css({
				'height': '100%'
			});
			$('.legend_colors').hide();

		},
		hideLegend: function() {
			$('#mobile-hide-show').hide();
			$('.hidelegend-icon').hide();
			$('#legend-text').hide();
			$('.showlegend-icon').show();
			$('#legend').css({
				'height': 'auto'
			});
			$('.legend_colors').show();
		}
	});

	// Set change for dropdown attributes
	AppView = Backbone.View.extend({
		el: 'body',

		events: {
			"change .checkbox_json": "dropdownAttributeChange",
			// "click a": "scrollToTop",
			"click .nav a": "navTabs"
		},

		// Toggles through view options
		dropdownAttributeChange: function(e) {
			// Add, remove markers
			map.removeJSON();
		
			return this;
		},

		// Hacky way of scrolling to top of page
		// And then setting height of page to 100%
		// scrollToTop: function() {
		// 	$(".ui-mobile .ui-page").css({
		// 		"height": "auto"
		// 	});

		// 	$('html,body').animate({ scrollTop: 0 }, 'fast'); 
			
		// 	$(".ui-mobile .ui-page").css({
		// 		"height": "99.9%"
		// 	});

		// 	return this;
		// },

		// This is for our DataTables
		navTabs: function(e) {
			var layer = e.target;
			
			// Darken box when clicked
			$(e.target).css({
				'background-color': '#D6D6D6',
				'border-top': '1px solid #BEBEBE',
				'border-left': '1px solid #BEBEBE',
				'border-right': '1px solid #BEBEBE'
			});

			// Lighten other boxes
			$(e.target).parent().siblings().children().css({
				'background-color': '#EEE',
				'border-top': '1px solid #DDD',
				'border-left': '1px solid #DDD',
				'border-right': '1px solid #DDD',
			})
			var name_table = $(layer).text();

			// Hide, show tables using function in load-map.js
			map.hideShowTables("" + name_table);

			return this;
		}
	});
	// Fire off Backbone stuff
	var appview = new AppView();
	var approuter = new AppRouter();

	// Set height of page if on desktop
	// if ($(window).width() > 625) {
	// 	$(".ui-mobile .ui-page").css({
	// 		"height": "99.9%"
	// 	});
	// }

	// Used for hash
	Backbone.history.start();

	
	// Stupid freakin' scroll-to-top hack because IE sucks
	if ($('html.nonie').size()) {
    	require(['jquery'], function($) {
        	$('.scrolltotop').click(function() {
	        	if ($(window).width() > 625) {
	        		$(".ui-mobile .ui-page").css({
						"height": "auto"
					});
				}
				
				$('html,body').animate({ scrollTop: 0 }, 'fast'); 
				
				if ($(window).width() > 625) {
					$(".ui-mobile .ui-page").css({
						"height": "99.9%"
					});
				}
        	});
    	});
	}

	// Hide icons on menu panel because IE sucks
	if ($('html.ie').size()) {
    	var head = document.getElementsByTagName('head')[0],
		        style = document.createElement('style');
		style.type = 'text/css';
		style.styleSheet.cssText = '.icon-panel:before, .icon-panel:after{content:none !important;}';
		head.appendChild(style);
	}

   // JSON load for tables
	require(['app/load-json'], function(){});

	$('#spinner').remove();

	// Show content after everything is loaded
	$(".pages-content").css({
		visibility: 'visible'
	});
	$("#share").css({
		visibility: 'visible'
	});
});