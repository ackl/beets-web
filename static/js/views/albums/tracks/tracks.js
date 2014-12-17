var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
Backbone.$ = $;

var AlbumSongItemView = require('./track');

module.exports = Backbone.View.extend({
	tagName: 'ul',
	// className: this.collection.album,
	render: function() {
		console.log(this.collection);
		// this.$el.html('')
		if (this.collection.length > 14) {
			console.log(this.collection.length);
			this.className = 'ul-col-2';
		}
		this.collection.forEach(function(item) {
			var songItemView = new AlbumSongItemView({model: item});
			// songItemView.render();
			this.$el.append(songItemView.render().el);
		}, this);

		return this;
	}
});
