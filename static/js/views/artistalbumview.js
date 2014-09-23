var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
Backbone.$ = $;
var AlbumSongListView = require('./albumsonglistview');

module.exports = Backbone.View.extend({
	initialize: function() {
		$('#progress-bar').click(function() {
			console.log('clicked outer div');
		});
		$('.progBar').click(function() {console.log('clicked inner div')});
	},
	events: {
		'mouseover': 'hover',
		'mouseleave': 'mouseout',
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
				// that.$el.css('background-image', 'url(\'http://i.imgur.com/XTpWUYg.png\')');
				that.$el.css('background-image', 'url(\'http://i.imgur.com/uHgieji.png\')');
				that.$el.css('filter', 'hue-rotate(120deg)')
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
    	// console.log(this.model.items);
    	// var url = '/item/' + this.model.items[0].id + '/file';
    	// console.log(url);
    	this.$('.content').addClass('album-song-list')
    	// this.$('.content').css({'height': '100%', 'font-size': '0.55em', 'opacity': '0.88'});
    	this.$('.table-cell').empty();
    	this.$('.table-cell').before('<h4>'+this.model.album+'</h4>');
    	// this.$('.table-cell').append('<h1>'+this.model)
    	var theSongs = new AlbumSongListView({collection: this.model.items});
    	// theSongs.render();
    	this.$('.table-cell').append(theSongs.render().el);
    	if (this.model.items.length > 16) {
    		this.$('ul').addClass('ul-col-2');
    	}
    	if (this.model.items.length > 13) {
    		this.$('.table-cell').addClass('valign-bottom');
    	}
    	if (this.model.items.length < 8) {
    		this.$('ul').addClass('bigtext');
    	}
    	// this.model.items.forEach(function(item){
    	// 	this.$('.table-cell').append('<li style="list-style-type: none">'+item.title+'</li>');
    	// 	// console.log(item.title);
    	// }, this);
    }
});