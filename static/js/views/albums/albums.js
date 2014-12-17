var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var ArtistAlbumView = require('./album');
Backbone.$ = $;

module.exports = Backbone.View.extend({
	initialize: function() {
		// this.render();
	},
	events: {
		"click .home": "goHome"
	},
	render: function() {
		console.log(this.model);
		console.log('that as model');
		// $('#nowplaying').html(this.model[0].albumartist);
		// $('h1').after('<h2 class="artist-heading">'+this.model[0].albumartist+'</h2>');
		$('h1').addClass('home');
		this.model.forEach(function(album){
		var albumArt = this.getArtURL(album.id);
		var albumArtView = new ArtistAlbumView({model: album});
		this.$el.append(albumArtView.render().el);
		// this.$el.append('<div class="square bg" style="background-image: url(\''+albumArt+'\')"><div class="content"><div class="table"><div class="table-cell"><div>'+album.album+'<div></div></div></div></div>');
		}, this);

		return this
	},
	getArtURL: function(id) {
        return "/album/"+id+"/art";
    },
    goHome: function() {
    	console.log('at go home');
    	this.destroy_view();
    	Backbone.history.navigate('', true);
    },
    destroy_view: function() {

	    // COMPLETELY UNBIND THE VIEW
	    this.undelegateEvents();

	    this.$el.removeData().unbind();
	    // Remove view from DOM
	    this.remove();
	    Backbone.View.prototype.remove.call(this);

	}
});
