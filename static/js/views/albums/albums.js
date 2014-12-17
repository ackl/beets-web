var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var ArtistAlbumView = require('./album');
Backbone.$ = $;

module.exports = Backbone.View.extend({
	initialize: function() {
	},

	events: {
		"click .home": "goHome"
	},

	render: function() {
		$('h1').addClass('home');
		this.model.forEach(function(album){
            this.$el.append(new ArtistAlbumView({model: album}).render().el);
		}, this);

		return this;
	},

	getArtURL: function(id) {
        return "/album/"+id+"/art";
    },

    goHome: function() {
    	console.log('at go home');
    	this.destroyView();
    	Backbone.history.navigate('', true);
    },

    destroyView: function() {
	    this.undelegateEvents();
	    this.$el.removeData().unbind();
	    this.remove();
	    Backbone.View.prototype.remove.call(this);
	}
});
