var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var Track = require('../models/track');
Backbone.$ = $;

var Tracks = Backbone.Collection.extend({
	url: '/item',
	parse: function(response) {
        return response.items;
    },
    model: Track
});

module.exports = new Tracks([]);