var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
Backbone.$ = $;

var ArtistListView = require('../views/artists/artists.js');
var Artists = require('../collections/artists');
var ArtistAlbumsView = require('../views/albums/albums');
var SoundQueueView = require('../views/soundQueue');

module.exports = Backbone.Router.extend({
    initialize: function() {
    },

    routes: {
        "": "showArtistList",
        "artists/*query": "getArtistAlbums",
    },

    getArtistAlbums: function(query) {
        var that = this;
        $.getJSON('/album/query/' + query, function(data) {
            //albums is an array of album objects
            that.view = new ArtistAlbumsView({model: data.results});
            $('.23beets').html(that.view.render().el);
            $('.content').hide()
        });
    },

    showArtistList: function() {
        this.view = new ArtistListView({collection: Artists});
        Backbone.eventBus.trigger('showArtistList');
        if (!this._soundQueue) {
            var soundQueue = new SoundQueueView;
            soundQueue.render();
            $('body').append(soundQueue.render().el);
            this._soundQueue = true;
        }

    }
});
