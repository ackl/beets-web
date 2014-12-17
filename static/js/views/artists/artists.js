var Backbone = require('backbone');
var _ = require('underscore');
var Artists = require('../../collections/artists');
var ArtistItemView = require('./artist');
var SoundQueueView = require('./../soundQueue');
var $ = require('../../jquery');
Backbone.$ = $;
// var Artists = new Artists();

module.exports = Backbone.View.extend({
    tagName: 'ul',
    id: 'artist-list',
    initialize: function() {
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(Backbone.eventBus, 'showArtistList', this.showArtistList);
        var soundQueue = new SoundQueueView;
        soundQueue.render();
        $('body').append(soundQueue.render().el);
    },
    showArtistList: function() {
        this.collection.fetch({reset:true});
        $('.shrink-btn').click();
    },
    render: function() {
        $('.artist-heading').slideUp('fast');
    	var artistNames = this.collection.models[0].attributes.artist_names;
        this.$el.empty();
        var getRandomColor = this.getRandomColor;
    	var that = this.$el;
        artistNames.sort();
        var firstLetters = [];
        artistNames.forEach(function(name) {
            firstLetters.push(name[0])
        });
        firstLetters = _.uniq(firstLetters, false);
        that.append('<h3 class="letter-heads">'+firstLetters[0]+'</h3>');
        var counter = 1;
    	artistNames.forEach(function(artist) {
            if (artist[0] == firstLetters[counter]) {
                that.append('<h3 class="letter-heads">'+firstLetters[counter]+'</h3>');
                counter++
            }
    		  that.append(new ArtistItemView({model: artist}).render().el);
    	});
        // console.log(this.$el);
        $('.23beets').html(this.$el);
        // console.log(that);
        return this;
    },
    getRandomColor: function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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
