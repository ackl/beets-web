var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
Backbone.$ = $;
var AlbumSongListView = require('./tracks/tracks');
var Better = require('./albumExpanded');

module.exports = Backbone.View.extend({
	initialize: function() {
	},

	events: {
		'mouseover': 'hover',
		'mouseleave': 'mouseout',
		'click': 'clicked'
	},

	className: 'square bg',

	render: function() {
		var that = this;
		var albumArt = this.getArtURL(this.model.id);

		$.ajax({
			url: albumArt,
			success: function() {
				that.$el.css('background-image', 'url(\''+albumArt+'\')');
			},
			error: function() {
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
        var albumArt = this.getArtURL(this.model.id);
        this.albumView = new Better({model: this.model});

        $('#album-detail').html(this.albumView.render().el);

        $('html, body').animate({scrollTop : 0},300);
    }
});
