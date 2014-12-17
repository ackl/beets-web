var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var template = require('../../templates/albumsonglisttemplate.html');
var AlbumSongListView = require('./albumSongList');
Backbone.$ = $;

var AlbumSongItemView = require('./albumSongItem');

module.exports = Backbone.View.extend({
	initialize: function() {
		console.log(this.model.art);
	},
	events: {
		"click #shrink-album-detail": "shrink"
	},
	shrink: function() {
		this.$('.album-detail-content').empty();
		this.$el.animate({width:'toggle'},550);
		this.$('.album-detail-content').animate({width:'toggle'},550);
	},
	render: function() {
		var theSongs = new AlbumSongListView({collection: this.model.items});
		this.$el.html(template({
			name: this.model.album,
			artist: this.model.albumartist,
			url: '/album/'+this.model.id+'/art'
		}));
		this.$('.album-detail-content').append(theSongs.render().el).append(' <button class="btn shrink-btn" id="shrink-album-detail">shrink</button>');
		return this;
	}
});


