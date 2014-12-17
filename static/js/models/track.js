var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
Backbone.$ = $;

module.exports = Backbone.Model.extend({
    urlRoot: '/item',

    getArt: function() {
        var album_id = this.get('album_id');
        return "/album/"+album_id+"/art";
    },

    getAudioURL: function() {
        return "/item/"+this.id+"/file"
    }
});
