var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var Artists = require('../collections/artists');
var ArtistItemView = require('./artistlistitemview');
var template = require('../../templates/soundqueuetemplate.html');
Backbone.$ = $;

module.exports = Backbone.View.extend({
	initialize: function() {
		console.log('sound queue view got activated');
	},
	render: function() {
		this.$el.html(template);
		this.makeSortable();
		return this;
	},
	makeSortable: function() {
	    this.$( ".upnext-list" ).sortable({
	    	items: "li:not(.ui-state-disabled)",
	    	update: function(event, ui) {
	    		// var order = $(this).sortable('toArray', {attribute: 'value'});
                var order = $('.upnext-list').sortable('toArray');
                console.log(order);
                for (var i = 0; i < order.length; i++) {
                	order[i] = order[i].substring(4);
                }
                oldPositionIndexArray = [];
                order.forEach(function(ID) {
				    var index = Artists.queueArray.map(function(e) { return e.id; }).indexOf(ID);
				    oldPositionIndexArray.push(index)
				});
				console.log(order);
				newSoundArray = [Artists.queueArray[0]];
				oldPositionIndexArray.forEach(function(index) {
					newSoundArray.push(Artists.queueArray[index])
				});
				console.log(newSoundArray);
				Artists.queueArray = newSoundArray;
            }
	    });
	    $( ".upnext-list" ).disableSelection();
	    $('.glyphicon-step-forward').unbind('click').click(function(e) {
			soundID = Artists.queueArray[0].id;
			soundManager.stop(soundID);
			// console.log(Artists.queueArray);
			console.log(Artists.queueArray);
			// console.log('got clicked');
		});
	}
});