var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
Backbone.$ = $;

module.exports = Backbone.Model.extend({
	urlRoot: '/artist'
});