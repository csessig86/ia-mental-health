/* MAP TEMPLATE, FUNCTIONS & MOUSE EVENTS GO HERE */

// Our dependencies
define([
    'backbone',
    'leaflet',
    'leaflet-pip',
    'jquery.geocodify',
    'handlebars'
], function (Backbone, L, leafletPip, geocodify, Handlebars) {
    
    /* OUR GLOBAL VARIABLES */
    var map_one;
    var map;
    var geojson_map_one;
    var geojson_two_map_one;
    var geojson_map;
    var json_group = new L.FeatureGroup();
    var json_group_two = new L.FeatureGroup();
    // var json_group_three = new L.FeatureGroup();
    // var json_group_four = new L.FeatureGroup();
    var circle;
    var searchMarker;
    var searchIcon = L.AwesomeMarkers.icon({
        icon: 'icon-circle',
        color: 'red'
    });
    var clicked_icon;
    var clicked_icon_color;
    
    L.Icon.Default.imagePath = 'css/images'

    /* OUR GLOBAL FUNCTIONS */

    // Add commas to numbers
    function numberFormat(nStr){
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1))
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
        return x1 + x2;
    }

    // Our large popups
    function popupLargeOpen(el, content_array) {
        // Create a view
        PopupLargeView = Backbone.View.extend({
            // Grab el from function parameters
            el: el,

            initialize: function(){
                this.handlebarsHelpers();
                this.render();
            },
            // Our register helper 
            handlebarsHelpers: function() {
                Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
                    var operators, result;
                    
                    if (arguments.length < 3) {
                        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
                    }
                    
                    if (options === undefined) {
                        options = rvalue;
                        rvalue = operator;
                        operator = "===";
                    }
                    
                    operators = {
                        '==': function (l, r) { return l == r; },
                        '===': function (l, r) { return l === r; },
                        '!=': function (l, r) { return l != r; },
                        '!==': function (l, r) { return l !== r; },
                        '<': function (l, r) { return l < r; },
                        '>': function (l, r) { return l > r; },
                        '<=': function (l, r) { return l <= r; },
                        '>=': function (l, r) { return l >= r; },
                        'typeof': function (l, r) { return typeof l == r; }
                    };
                    
                    if (!operators[operator]) {
                        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
                    }
                    
                    result = operators[operator](lvalue, rvalue);

                    if (result) {
                        return options.fn(this);
                    } else {
                        return options.inverse(this);
                    }

                });

                Handlebars.registerHelper('removeHTTP', function (object) {
                    object = object + "";
                    var new_object = object.replace('http://www.', '')
                    var new_new_object = new_object.replace('.org/', '.org')
                    var new_new_new_object = new_new_object.replace('.com/', '.com')
                    return new Handlebars.SafeString(new_new_new_object);
                });
            },
            // Called on intialize
            render: function(){
                var el = this.$el;
                el.empty();

                // Compile the template using Handlebars
                var source = $('#popups-large-template').html();
                var handlebarscompile = Handlebars.compile(source);
                // Render the templates
                
                // The content in our JSON file
                // We'll append to our Handlebars template
                el.append( handlebarscompile(content_array) );
                
                // Show the right stuff
                if ($(window).width() > 575) {
                    $('.popup_cover').show();
                }
                $('#popup-box').find('.toggle_popup').show();
                $('#popup-box').show();

                return this;
            }
        });
        // This puts view on the page
        popuplargeview = new PopupLargeView();
    // End popup function
    }

    /* GEOJSON STYLES */
    // Set color of each polygon
    function styleGeoJSON(feature) {
        // Use one attribute in GeoJSON file to color
        if (feature.properties.REGION === "Yes") {
            var fill_color = "#999";
        } else {
            var fill_color = "#EEE";
        }
        
        // Return our colors
        return {
            "color": "#FFF",
            "weight": 1,
            "opacity": 0.8,
            "fillOpacity": 0.5,
            "fillColor": fill_color
        }
    };
    function styleGeoJSONTwo(feature) {
        // Return our colors
        return {
            "color": "#FFF",
            "weight": 1,
            "opacity": 0.8,
            "fillOpacity": 0.5,
            "fillColor": "#999"
        }
    };

    function styleGeoJSONStateOutline(feature) {
        // Return our colors
        return {
            "color": "#333",
            "weight": 1,
            "opacity": 0.8,
            "fillOpacity": 0,
            "fillColor": "FFF",
            "clickable": false
        }
    };

    // Set the mouseover, mouseout events
    // For our GeoJSON polygons
    function onEachFeature(feature, layer_geojson) {
        layer_geojson.on({
            // Highlight polygons
            mouseover: function (e) {
                var layer_geojson = e.target;
                layer_geojson.setStyle({
                    "fillOpacity": 0.95,
                });
            },
            // Reset the polygon styles
            mouseout: function (e) {
                var layer_geojson = e.target;
                layer_geojson.setStyle({
                    "color": "#FFFFFF",
                    "weight": 1,
                    "opacity": 0.8,
                    "fillOpacity": 0.5,
                });
            }
        });
        
        // Show regular popup
        var properties = layer_geojson.feature.properties;
        var popup_content = '<div class="popup_box" ' + ' id= "' + properties.NAMELSAD10 + '">';
        popup_content = '<div class="popup_box_header">' + properties.NAMELSAD10 + '</div>';
        popup_content += '<hr />';
        if (feature.properties.REGION === "Yes") {
            popup_content += 'This county is part of the MHDS region.';
        } else {
            popup_content += 'This county is not part of the MHDS region.';
        }
        layer_geojson.bindPopup(popup_content);
    };


    /* GEOCODE FUNCTIONS */
    // Convert miles to meters to set radius of circle
    function milesToMeters(miles) {
        return miles * 1069;
    };

    // Place our markers over our radius circle
    function featureGroupOverRadiusCircle() {
        // Make sure groups are on map before bringing to front
        // if (json_group_four._map !== null) {
        //     json_group_four.bringToFront();
        // }
        if (json_group_two._map !== null) {
            json_group_two.bringToFront();
        }
        if (json_group._map !== null) {
            json_group.bringToFront();
        }
        // if (json_group_three._map !== null) {
        //     json_group_three.bringToFront();
        // }
    }

    // This places marker, circle on map
    function geocodePlaceMarkersOnMap(location) {
        // Resets map size when hiding, showing DIVs
        map.invalidateSize();
        // Center the map on the result
        map.setView(new L.LatLng(location.lat(), location.lng()), 10);
        // Resets map size when hiding, showing DIVs
        map.invalidateSize();

        // Remove circlue if one is already on map
        if(circle) {
            map.removeLayer(circle);
        }
        
        // Create circle around marker with our selected radius
        circle = L.circle([location.lat(), location.lng()], milesToMeters( $('#radiusSelected').val() ), {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.1,
            clickable: false
        }).addTo(map);
        
        // Place our markers over our radius circle
        featureGroupOverRadiusCircle();

        // Remove marker if one is already on map
        if (searchMarker) {
            map.removeLayer(searchMarker);
        }
        
        // Create marker
        searchMarker = L.marker([location.lat(), location.lng()], {
            // Allow user to drag marker
            draggable: true,
            icon: searchIcon
        });
        
        // Reset map view on marker drag
        searchMarker.on('dragend', function(event) {
            map.setView( event.target.getLatLng() ); 
            circle.setLatLng( event.target.getLatLng() );
            
             // This will determine how many markers are within the circle
             pointsInCircle( circle, milesToMeters( $('#radiusSelected').val() ) );

             // Redraw: Leaflet function
             circle.redraw();

             // Clear out address in geocoder
             $('#geocoder_one-input').val('');
        });
        
        // This will determine how many markers are within the circle
        // Called when points are initially loaded
        pointsInCircle( circle, milesToMeters( $('#radiusSelected').val() ) );

        // Add marker to the map
        searchMarker.addTo(map);

        // Open up map page if geocoder is on second page
        if (window.location.hash === '#second') {
            window.location.hash = '#map';
        // Hide legend if geocoder is within legend
        } else if (window.location.hash === '#showlegend') {
            window.location.hash = '#hidelegend';
        }

    // Close geocodePlaceMarkersOnMap
    }
    
    // This figures out how many points are within out circle
    function pointsInCircle(circle, meters_user_set ) {
        if (circle !== undefined) {
            // This checks to see if the address is within the region
            // Shows the view options if so
            // Shows an error message if not
            arrayPip = leafletPip.pointInLayer(circle.getLatLng(), geojson_map);
            if (arrayPip.length === 0) {
                $('.within-region').hide();
                $('.not-within-region').show();
            } else {
                $('.not-within-region').hide();
                $('.within-region').show();
            }

            // Only run if we have an address entered
            // Lat, long of circle
            circle_lat_long = circle.getLatLng();

            // Our JSON files
            json_groups = [
                {
                    'file': 'json_one',
                    'value': json_group,
                    'title_singular': 'regional office',
                    'title_plural': 'regional offices'
                },{
                    'file': 'json_two',
                    'value': json_group_two,
                    'title_singular': 'provider',
                    'title_plural': 'providers'
                }
            ];

            // Loop through each JSON file
            _.each(json_groups, function(json_group_this){
                var selected_provider = $('#dropdown_select').val();

                var json_file = json_group_this['file'];
                var current_value = json_group_this['value'];
                var title_singular = json_group_this['title_singular'];
                var title_plural = json_group_this['title_plural'];

                var counter_points_in_circle = 0;

                // Loop through each point in JSON file
                // Only if it's on the map
                if (current_value._map !== null) {
                    // console.log(current_value);

                    // Goes through each marker in JSON file
                    current_value.eachLayer(function (layer) {
                        // console.log(layer);

                        // Lat, long of current point
                        layer_lat_long = layer.getLatLng();
                        // Distance from our circle marker
                        // To current point in meters
                        distance_from_layer_circle = layer_lat_long.distanceTo(circle_lat_long);

                        // See if meters is within raduis
                        // The user has selected
                        if (distance_from_layer_circle <= meters_user_set) {
                            counter_points_in_circle += 1;

                            // // If providers
                            // if (title_singular === 'provider') {
                            //     if (selected_provider === 'all') {
                            //         counter_points_in_circle += 1;
                            //     } else {
                            //         counter_points_in_circle += 0;
                            //     }
                            // // If regional offices
                            // } else {
                            //     counter_points_in_circle += 1;
                            // }
                        }
                    });
                }
                
                // If we have just one result, we'll change the wording
                // So it reflects the category's singular form
                // I.E. facility not facilities
                if (counter_points_in_circle === 1) {
                    $('#' + json_file + '_title').html( title_singular );
                // If not one, set to plural form of word
                } else {
                    $('#' + json_file + '_title').html( title_plural );
                }
                
                // Set number of results on main page
                $('#' + json_file + '_results').html( counter_points_in_circle );

                // For mobile
                $('#results-radius-mobile').html('within ' + $('#radiusSelected').val() + ' miles' );
            }, this);
        }
    };

    /* REQUIRE.JS FUNCTIONS */
    // Called from require-load.js file
    return {
        // Set intial view of map
        baseMap: function() {
            // First map
            map_one = new L.map("map_one", {
                dragging: false,
                keyboard: false,
                touchZoom: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                zoomControl: false,
                attributionControl: false,
                minZoom: 1,
                maxZoom: 100
            });
        },
        // Set second map
        baseMapTwo: function() {
            // Information for the base tile
            // More options: http://leaflet-extras.github.io/leaflet-providers/preview/
            // Second map
            map = new L.map("map", {
                layers: L.tileLayer.provider('Stamen.Toner'),
                center: [42.748903,-93.3],
                zoom: 7,
                minZoom: 5,
                maxZoom: 17,
                maxBounds: [[38.95,-101.88],[44.85,-85.35]]
            });

            // Mobile view
            if ($(window).width() < 626) {
                map.setView([42.748903,-92.856445],6);
            }
        },
        // Invalidate size of map
        mapInvalidateSize: function() {
            map.invalidateSize();
        },
        // This sets our reset map view button
        resetZoom: function() {
            // This function darkens the button
            function resetZoomToIA() {
                $('#zoom-to-iowa a').css({
                    'background-color': '#fff',
                    'color': '#333',
                    'cursor': 'pointer'
                });
            };

            // Button is lightened whever button is clicked
            $('#zoom-to-iowa a').click(function() {
                map.setView([42.748903,-93.3],7);
                $(this).css({
                    'background-color': '#f4f4f4',
                    'color': '#bbb',
                    'cursor': 'text'
                });
            });

            // Button is darkened whenever user moves map
            map.on('dragend', function(e) {
                resetZoomToIA();
            });
            map.on('zoomend', function(e) {
                if (map.getZoom() !== 8) {
                    resetZoomToIA();
                }
            });
        },
        // Add GeoJSON to map
        geoJSON: function() {
            // Set view of Leaflet map based on screen size
            // Our geoJSON variable

            // First map
            geojson_map_one = L.geoJson(polygons, {
                style: styleGeoJSON,
                onEachFeature: onEachFeature
            }).addTo(map_one);

            geojson_two_map_one = L.geoJson(polygon_ia, {
                style: styleGeoJSONStateOutline
            }).addTo(map_one);

            map_one.fitBounds(geojson_map_one.getBounds());
        },
        // Add GeoJSON to second map
        geoJSONTwo: function() {
            // Second map
            geojson_map = L.geoJson(polygons_ne_ia, {
                style: styleGeoJSONTwo
            }).addTo(map);

            // Turn cursor to default for geojson layers that readers can't click
            geojson_map.eachLayer(function(layer){
                layer._path.setAttribute('style','cursor: default;');
            });
        },
        // Remove GeoJSON layer
        resetMap: function() {
            map.removeLayer(geojson);
        },
        // THIS SETS MARKERS
        // TABLE DATA
        // Mapping data from JSON file
        loadJSON: function() {
            // This sets markers on map
            // It's fired for every JSON file
            function loadToMap(context, fill_color, title) {
                // Pull map information from JSON file
                var countJSON = 0;

                _.each(context, function(num) {
                    countJSON += 1;
                    var dataLat = num['latitude'];
                    var dataLong = num['longitude'];

                    // Add to our marker
                    var marker_location = new L.LatLng(dataLat, dataLong);


                    // Make circle markers larger on mobile so their easier to click
                    if ($(window).width() < 576) {
                        set_radius = 10;
                    } else {
                        set_radius = 7;
                    }

                    // Options for our circle marker
                    var layer_marker = L.circleMarker(marker_location, {
                        radius: set_radius,
                        fillColor: fill_color,
                        color: "#FFFFFF",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });

                    // Add events to marker
                    layer_marker.on({
                        // What happens when mouse hovers markers
                        mouseover: function(e) {
                            var layer_marker = e.target;
                            layer_marker.setStyle({
                                radius: set_radius,
                                fillColor: "#FFFFFF",
                                color: "#000000",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 1
                            });
                        },
                        click: function(e) {
                            // This resets the style of marker we previously clicked on
                            // This basically only shows up on mobile
                            if (clicked_icon !== undefined && clicked_icon !== "" && clicked_icon !== null) {
                                clicked_icon.setStyle({
                                    radius: set_radius,
                                    fillColor: clicked_icon_color,
                                    color: "#FFFFFF",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });
                            }

                            // This sets the circle white to the marker we just clicked
                            var layer_marker = e.target;
                            layer_marker.setStyle({
                                radius: set_radius + 1,
                                fillColor: "#FFFFFF",
                                color: "#000000",
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 1
                            });

                            // This sets global variable marker we just clicked
                            // We do this so we can reset the style of it next time a marker is clicked
                            clicked_icon = layer_marker;
                            clicked_icon_color = fill_color;
                        },
                        // What happens when mouse leaves the marker
                        mouseout: function(e) {
                            var layer_marker = e.target;
                            layer_marker.setStyle({
                                radius: set_radius,
                                fillColor: fill_color,
                                color: "#FFFFFF",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8
                            });
                        }
                    });

                    // Create the large popup
                    // This will open a separate window for the popup
                    // That is nearly full screen
                    (function (num){
                        // Must call separate popup(e) function to make sure right data is shown
                        function popup(e) {
                            var layer_marker = e.target;

                            // Grab the info from the marker that was clicked
                            // Here's the content we're using
                            if ( context === json_data ) {
                                content_array = [{
                                    'header': num['county'],
                                    'body': [{
                                        'title': 'Address',
                                        'value': num['address01']
                                    },{
                                        'title': 'Address02',
                                        'value': num['address02']
                                    },{
                                        'title': 'City',
                                        'value': num['city'] 
                                    },{
                                        'title': 'Address_City',
                                        'value': num['address01'] + ' ' + num['city'] 
                                    },{
                                        'title': 'Phone',
                                        'value': num['phone']
                                    },{
                                        'title': 'Services',
                                        'value': num['services']
                                    }]
                                }];
                            // Go through second JSON file
                            // And create popups
                            } else if (context === json_data_two ) {
                                content_array = [{
                                    'header': num['name'],
                                    'body': [{
                                        'title': 'Address',
                                        'value': num['address01']
                                    },{
                                        'title': 'Address02',
                                        'value': num['address02']
                                    },{
                                        'title': 'Address03',
                                        'value': num['address03']
                                    },{
                                        'title': 'City',
                                        'value': num['city']
                                    },{
                                        'title': 'Address_City',
                                        'value': num['address01'] + ' ' + num['city'] 
                                    },{
                                        'title': 'Phone',
                                        'value': num['phone']
                                    },{
                                        'title': '24-hour phone',
                                        'value': num['24_hour_phone']
                                    },{
                                        'title': 'Website',
                                        'value': num['website']
                                    },{
                                        'title': 'Services',
                                        'value': num['services']
                                    },{
                                        'title': 'Services_etc',
                                        'value': num['services_two']
                                    },{
                                        'title': 'Services_etc',
                                        'value': num['services_three']
                                    },{
                                        'title': 'Services_etc',
                                        'value': num['services_four']
                                    },{
                                        'title': 'Services_etc',
                                        'value': num['services_five']
                                    }]
                                }];
                            }

                            // // Go through third JSON file
                            // // And create popups
                            // else if ( context === json_data_three ) {
                            //     content_array = [{
                            //         'header': num['hospital'],
                            //         'body': [{
                            //             'title': 'Address',
                            //             'value': num['address']
                            //         },{
                            //             'title': 'City',
                            //             'value': num['city'] 
                            //         },{
                            //             'title': 'Address_City',
                            //             'value': num['address'] + ' ' + num['city'] 
                            //         },{
                            //             'title': 'Phone',
                            //             'value': num['phone']
                            //         }]
                            //     }];
                            // // Go through fourth JSON file
                            // // And create popups
                            // } else if ( context === json_data_four ) {
                            //     content_array = [{
                            //         'header': num['name'],
                            //         'body': [{
                            //             'title': 'Address',
                            //             'value': num['address01']
                            //         },{
                            //             'title': 'Address02',
                            //             'value': num['address02']
                            //         },{
                            //             'title': 'Address03',
                            //             'value': num['address03']
                            //         },{
                            //             'title': 'City',
                            //             'value': num['city'] + ', Iowa ' + num['zip']
                            //         },{
                            //             'title': 'Address_City',
                            //             'value': num['address01'] + ' ' + num['city'] + ' Iowa, ' + num['zip']
                            //         },{
                            //             'title': 'Phone',
                            //             'value': num['phone']
                            //         },{
                            //             'title': 'Services',
                            //             'value': num['services']
                            //         },{
                            //             'title': 'Services_etc',
                            //             'value': num['services_two']
                            //         },{
                            //             'title': 'Services_etc',
                            //             'value': num['services_three']
                            //         }]
                            //     }
                            // ];
                            // }
                            // Calls our function at the top to display
                            popupLargeOpen('#popup-box', content_array);
                        // Close popup(e) function
                        }

                        // Open the popup function when one of our markers is clicked
                        // Using scoping function above
                        layer_marker.on({
                            click: popup
                        });
                        
                        if ( context === json_data ) {
                            json_group.addLayer(layer_marker);
                        } else if (context === json_data_two ) {
                            json_group_two.addLayer(layer_marker);
                        }

                        // else if (context === json_data_three ) {
                        //     json_group_three.addLayer(layer_marker);
                        // } else if (context === json_data_four ) {
                        //     json_group_four.addLayer(layer_marker);
                        // }

                    // Close popup function
                    })(num) 

                    // Display map data based on checkbox
                    if ( $('#json_two').prop('checked') === true) {
                        map.addLayer(json_group_two);
                    }

                    if ( $('#json_one').prop('checked') === true) {
                        map.addLayer(json_group);
                    }
                    // if ( $('#json_three').prop('checked') === true) {
                    //     map.addLayer(json_group_three);
                    // }
                    // if ( $('#json_four').prop('checked') === true) {
                    //     map.addLayer(json_group_four);
                    // }
                // Close context for loop
                }, this);

                // Put number of places in legend
                // When no address is given
                $('#' + title).html(countJSON)
            // Close LoadToMap function
            }
            
            // Fire functions that puts the markers on the map
            // loadToMap(json_data_four, "#377eb8", "json_four_results");
            loadToMap(json_data_two, "#4daf4a", "json_two_results");
            loadToMap(json_data, "#984ea3", "json_one_results");
            // loadToMap(json_data_three, "#ff7f00", "json_three_results");
        // Close loadJSON method
        },
        removeJSON: function() {
            // Ran in box is checked
            function checkedBox(number) {
                $('#json_' + number + '_results').css({
                    'visibility': 'visible'
                });
                $('#json_' + number + '_title').css({
                    'color': '#333'
                });
            }

            // Ran if box is not checked
            function uncheckedBox(number) {
                // Clear number
                $('json_' + number + '_results').html('');
                $('#json_' + number + '_results').css({
                    'visibility': 'hidden'
                });
                $('#json_' + number + '_title').css({
                    'color': '#CCC'
                });
            }

            // Display map data based on checkbox
            // Second checkbox
            if ( $('#json_two').prop('checked') === true) {
                map.addLayer(json_group_two);
                checkedBox('two');
            } else {
                map.removeLayer(json_group_two);
                uncheckedBox('two');
            }

            if ( $('#json_one').prop('checked') === true) {
                map.addLayer(json_group);
                checkedBox('one');
            } else {
                map.removeLayer(json_group);
                $('json_one_results').html('');
                uncheckedBox('one')
            }

            // // Third checkbox
            // if ( $('#json_three').prop('checked') === true) {
            //     map.addLayer(json_group_three);
            //     checkedBox('three');
            // } else {
            //     map.removeLayer(json_group_three);
            //     uncheckedBox('three');
            // }

            // // Fourth checkbox
            // if ( $('#json_four').prop('checked') === true) {
            //     map.addLayer(json_group_four);
            //     checkedBox('four');
            // } else {
            //     map.removeLayer(json_group_four);
            //     uncheckedBox('four');
            // }

            // Reset the number of points in circle
            // For legend
            // Just in case they toggle it back
            // The correct number will be shown
            if (circle !== undefined && circle !== '') {
                pointsInCircle(circle, milesToMeters( $('#radiusSelected').val() ) )
            }
        },
        // Geocodify
        geocode: function() {
            var maxY = 43.749935;
            var minY = 40.217754;
            var minX = -96.459961;
            var maxX = -90.175781;

            // Function is called for every geocoder in the app
            function geocodify(geocoder_this) {
                // Geocodify our geocoders
                geocoder_this.geocodify({
                    onSelect: function (result) {
                        // Extract the location from the geocoder result
                        var location = result.geometry.location;

                        // Call function and place markers, circle on map
                        geocodePlaceMarkersOnMap(location);
                    },
                    initialText: 'Enter your address...',
                    regionBias: 'US',
                    // Lat, long information for Cedar Valley enter here
                    viewportBias: new google.maps.LatLngBounds(
                        new google.maps.LatLng(41.896016,-95.223999),
                        new google.maps.LatLng(43.749935, -90.175781)
                    ),
                    width: 300,
                    height: 26,
                    fontSize: '14px',
                    filterResults: function (results) {
                        var filteredResults = [];
                        $.each(results, function (i, val) {
                            var location = val.geometry.location;
                            if (location.lat() > minY && location.lat() < maxY) {
                                if (location.lng() > minX && location.lng() < maxX) {
                                    filteredResults.push(val);
                                }
                            }
                        });
                        return filteredResults;
                    }
                });
            }
            // This stores names of each geocoder on page
            var geocoders = ['one', 'two'];

            // Loop through each geocoder
            _.each(geocoders, function(num_geo){
                // Call our geocodify function for each geocoder on page
                geocodify( $('#geocoder_' + num_geo ) );
            }, this);

            // Find my location button
            // $('#find_me').on('click', function () {
            //     navigator.geolocation.getCurrentPosition(function (position) {
            //         var lat = position.coords.latitude;
            //         var lng = position.coords.longitude;
            //         map.setView(new L.LatLng(lat, lng, 8));
            //         // Remove marker if one is already on map
            //         if (searchMarker) {
            //             map.removeLayer(searchMarker);
            //         }
            //         // Create marker
            //         searchMarker = L.marker([location.lat(), location.lng()], {
            //             clickable: false,
            //             icon: searchIcon
            //         });
            //         // Add marker to the map
            //         searchMarker.addTo(map);

            //     }, function (error) {
            //         alert("Sorry! We couldn't find your address. Please try again.");
            //     });
            // });
        // Close geocode
        },
        // Clears inputs of our geocoders on page two
        clearGeocoders: function() {
            var geo_one = $('#geocoder_one-input');
            var geo_two = $('#geocoder_two-input');

            // Clear out page two geocoder
            geo_two.val('');
        },
        // The legend and table view
        legendTableView: function() {
            // Defaults
            var isVisibleDescription = false;
            // 'Hide legend' button displayed
            var isHideButton = true;

            // This view runs all our click events for our legend
            // And the 'View table' button
            LegendTableView = Backbone.View.extend({
                el: 'body',

                events: {
                    "click .toggle_description": "panelDisplay",
                    "click .popup .toggle_popup": "closeLargePopup",
                    "click #toggle-table": "openTablePopup",
                    "change select": "changeCircleRadius"
                },

                // Toggle for panel on right side of page
                panelDisplay: function() {
                    var panel_closed = $('#menu-panel').hasClass('ui-panel-closed');
                    var panel_open = $('#menu-panel').hasClass('ui-panel-open');

                    if (panel_closed) {
                        $('#menu-panel').panel().panel('open');
                        $('#credits').show();
                    } else if (panel_open) {
                        $('#menu-panel').panel().panel('close');
                        $('#credits').hide();
                    }
                },

                // This closes our large popups
                closeLargePopup: function() {
                    $('.popup_cover').hide();
                    $('.toggle_popup').hide();
                    $('.popup').hide();
                    $('#footer-table').hide();

                    // This resets the marker style if we click out of its popup box with the X button
                    // Basically only visible on mobile
                    if (clicked_icon !== undefined && clicked_icon !== "" && clicked_icon !== null) {
                        clicked_icon.setStyle({
                            radius: set_radius,
                            fillColor: clicked_icon_color,
                            color: "#FFFFFF",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        });
                    }
                },
                // This opens our table popup
                openTablePopup: function() {
                    $('.popup_cover').show();
                    $('.toggle_popup').show();
                    $('#content-box').show();
                    
                    // Show our mobile footer button
                    if ($(window).width() < 626) {
                        $('#footer-table').show();
                    }
                },
                // Change circle radius when changed
                changeCircleRadius: function(e) {
                    // Determine which geocode box is filled
                    // And fire click event

                    // This will determine how many markers are within the circle
                    pointsInCircle(circle, milesToMeters( $('#radiusSelected').val() ) )

                    // Set radius of circle only if we already have one on the map
                    if (circle) {
                        circle.setRadius( milesToMeters( $('#radiusSelected').val() ) );
                    }

                    // Hide legend if on mobile
                    if (window.location.hash === '#showlegend' && $('#geocoder_one-input').val() !== '') {
                        window.location.hash = '#hidelegend';
                    }
                }
            });
            // This puts view on the page
            legendtableview = new LegendTableView();
        // Close legend and table view
        },
        // This hides and shows our DataTables
        hideShowTables: function(name_table) {
            $('.dataTables_wrapper').hide();

            if (name_table !== undefined && name_table !== "" && name_table !== null) {
                $('.table-name').text(name_table);

                // Delete whitespaces
                // Match text with ID name
                name_table = name_table.replace(/ /g,'')

                // Show appropriate table
                $('#searchable-' + name_table + "_wrapper").show();
            } else {
                $('#searchable-Regionaloffices_wrapper').show();

                $('#nav_regional').css({
                    'background-color': '#D6D6D6',
                    'border-top': '1px solid #BEBEBE',
                    'border-left': '1px solid #BEBEBE',
                    'border-right': '1px solid #BEBEBE'
                });
            }
        // Close hide, show DataTables function
        }
    // Close return
    }
// Close require
});