define([
    'jquery',
    'underscore',
    'backbone',
    'handlebars'
], function ($, _, Backbone, Handlebars) {
    // Set up view for JSON data
    JSONDataView = Backbone.View.extend({
        // What we're appending to
        el_json: [{
            'name': 'Regionaloffices',
            'file': json_data
        },{
            'name': 'Providers',
            'file': json_data_two
        }],
        
        initialize: function() {
            this.render();
            this.tableLoad();
        },
        // Render the templates
        render: function() {
            var el_json = this.el_json;

            // Loop through our JSON files
            _.each(el_json, function(item_json) {
                // Compile the template using Handlebars
                var source = $('#content-box-template').html();
                var handlebarscompile = Handlebars.compile(source);
                
                // The content in our JSON file
                // We'll append to our Handlebars template
                $('#searchable-' + item_json['name'] + ' tbody').append( handlebarscompile(item_json['file']) );
            }, this);
            
            return this;
        },
        tableLoad: function() {
            // Datatables load
            require(['app/load-datatables'], function(datatables){
                datatables.loadDataTables();
                // For mobile load
                if ($(window).width() < 476) {
                    datatables.mobileDatatablesOptions();
                }
            });
            
            return this;
        }
    });
    
    // Fire it off
    jsondataview = new JSONDataView();
});