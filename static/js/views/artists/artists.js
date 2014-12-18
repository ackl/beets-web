var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('../../jquery');
Backbone.$ = $;

var Artists = require('../../collections/artists');
var ArtistItemView = require('./artist');

module.exports = Backbone.View.extend({
    tagName: 'ul',

    id: 'artist-list',

    initialize: function() {
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(Backbone.eventBus, 'showArtistList', this.showArtistList);
    },

    showArtistList: function() {
        this.collection.fetch({reset:true});
        $('.shrink-btn').click();
    },

    render: function() {
        $('.artist-heading').slideUp('fast');
    	var artistNames = this.collection.models[0].attributes.artist_names;
        var firstLetters = [];

        this.$el.empty();
        artistNames.sort();

        artistNames.forEach(function(name) {
            firstLetters.push(name[0])
        });

        firstLetters = _.uniq(firstLetters, false);

        this.$el.append('<h3 class="letter-heads">'+firstLetters[0]+'</h3>');

    	var that = this;
        var counter = 1;
    	artistNames.forEach(function(artist) {
            // Place letter headings
            if (artist[0] == firstLetters[counter]) {
                that.$el.append('<h3 class="letter-heads">'+firstLetters[counter]+'</h3>');
                counter++;
            }

            that.$el.append(new ArtistItemView({model: artist}).render().el);
    	});

        $('.23beets').html(this.$el);

        return this;
    },

    destroyView: function() {
	    this.undelegateEvents();
	    this.$el.removeData().unbind();
	    this.remove();
	    Backbone.View.prototype.remove.call(this);
	}
});
