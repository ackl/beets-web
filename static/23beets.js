var app = app || {};



var Item = Backbone.Model.extend({
    urlRoot: '/item',
    getArt: function() {
        var album_id = this.get('album_id');
        return "/album/"+album_id+"/art";
    },
    getAudioURL: function() {
        return "/item/"+this.id+"/file"
    }
});
var Items = Backbone.Collection.extend({
	url: '/item',
	parse: function(response) {
        return response.items;
    },
    model: Item
});

var Artist = Backbone.Model.extend({
	urlRoot: '/artist'
})
var Artists = Backbone.Collection.extend({
	url: '/artist',
	model: Artist
})
var allArtists = new Artists();
allArtists.fetch({
	reset: true,
	success: function(response) {
	}
});
var ArtistElementView = Backbone.View.extend({
	tagName: 'li',
	render: function() {
		this.$el.html('<a href="#artists/'+this.model+'">'+this.model+'</a>');
		return this;
	}
});

var ArtistListView = Backbone.View.extend({
	tagName: 'ul',
    initialize: function() {
    	this.listenTo(allArtists, 'reset', this.render);
    },
    render: function() {
    	var artistNames = allArtists.models[0].attributes.artist_names;
    	// var that = this.$el
    	var that = this.$el;
    	artistNames.forEach(function(artist) {
    		that.append(new ArtistElementView({model: artist}).render().el);
    	});
    	$('#artist-list').html(that);
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
var ArtistAlbumView = Backbone.View.extend({
	events: {
		'mouseover': 'hover',
		'mouseout': 'mouseout',
		'click': 'clicked'
	},
	className: 'square bg',
	render: function() {
		var that = this;
		this.$el.append('<div class="content"><div class="table"><div class="table-cell"><div>'+this.model.album+'<br>'+this.model.tracktotal+' tracks'+'</div></div></div></div>');
		var albumArt = this.getArtURL(this.model.id);

		$.ajax({
			url: albumArt,
			success: function() {
				that.$el.css('background-image', 'url(\''+albumArt+'\')');
			},
			error: function() {
				that.$el.css('background-image', 'url(\'http://i.imgur.com/XTpWUYg.png\')');
			}
		});
		return this;
	},
	getArtURL: function(id) {
        return "/album/"+id+"/art";
    },
    hover: function() {
    	this.$('.content').slideDown('fast');
    },
    mouseout: function() {
    	this.$('.content').slideUp();
    },
    clicked: function() {
    	console.log(this.model.items);
    	var url = '/item/' + this.model.items[0].id + '/file';
    	console.log(url);
    }
});
var ArtistAlbumsView = Backbone.View.extend({
	initialize: function() {
		// this.render();
	},
	render: function() {
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
})
var BeetsRouter = Backbone.Router.extend({
    routes: {
        "artists/*query": "getArtistAlbums",
    },
    getArtistAlbums: function(query) {
        $.getJSON('/album/query/' + query, function(data) {
            app.view.destroy_view();
            //albums is an array of album objects
            app.view = new ArtistAlbumsView({model: data.results});
            $('body').append(app.view.render().el);
            $('.content').hide()
        });
    }
});
var router = new BeetsRouter();
Backbone.history.start({pushState: false});
var allSongs = new Items();

app.view = new ArtistListView();