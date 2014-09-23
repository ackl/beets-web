var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var Artist = require('../models/artist');
Backbone.$ = $;

var Artists = Backbone.Collection.extend({
	url: '/artist',
	model: Artist,
	queueArray: []
});

module.exports = new Artists([]);