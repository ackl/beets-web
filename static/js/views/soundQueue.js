var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var Artists = require('../collections/artists');
var ArtistItemView = require('./artists/artist.js');
var template = require('../../templates/soundqueuetemplate.html');
Backbone.$ = $;

module.exports = Backbone.View.extend({
	initialize: function() {
	},

	render: function() {
		this.$el.html(template);
		this.sortable();
		return this;
	},

	sortable: function() {
	    this.$( ".upnext-list" ).sortable({
	    	update: function(event, ui) {
                var queueIds = Artists.queueArray.map(function(e) { return e.id; }),
                    newOrder = $('.upnext-list').sortable('toArray'),
                    newSoundArray = _.map(newOrder, function(id) {
                        return Artists.queueArray[queueIds.indexOf(id.substring(4))];
                    });
                newSoundArray.unshift(Artists.queueArray[0]);
				Artists.queueArray = newSoundArray;
            }
	    });

	    $( ".upnext-list" ).disableSelection();

	    $('.glyphicon-step-forward').unbind('click').click(function(e) {
			soundID = Artists.queueArray[0].id;
			soundManager.stop(soundID);
		});
	}
});
