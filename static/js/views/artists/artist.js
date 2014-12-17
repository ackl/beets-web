var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
Backbone.$ = $;

module.exports = Backbone.View.extend({
	tagName: 'li',
	render: function() {
		this.$el.html('<a href="#artists/'+this.model+'">'+this.model+'</a>');
		return this;
	}
});
