var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
Backbone.$ = $;
var Artists = require('../../../collections/artists');
var app = app || {};

module.exports = Backbone.View.extend({

    tagName: 'li',

    events: {
        "click a": "selectSong"
    },

    /**
    * Renders link for song model.
    */
    render: function() {
        this.$el.html('<a href="#">' + this.model.title + '</a>');
        return this;
    },

    selectSong: function(e) {
        e.stopPropagation();
        var queue = Artists.queueArray;
        //console.log(queue);
        var length = queue.length;

        this.addSong(e);
        if (!length) {
            this.playRecursive();
        }

        if (queue.length > 1) {
            $('.upnext-list').append('<li id="song'+_.last(queue).id+'"><a>'+_.last(queue).title+'</a></li>');
        }
    },

    /**
    * Passes url to sound file and other info to createSound method
    */
    addSong: function(e){
        e.preventDefault();
        var url = this.getSongURL();
        var artURL = this.getArtURL(this.model.album_id);
        this.createSound(url, this.model.id, this.model.title, artURL, this.model.album, this.model.albumartist);
    },

    getArtURL: function(id) {
        return "/album/"+id+"/art";
    },

    getSongURL: function() {
        var url = '/item/' + this.model.id + '/file';
        return url
    },

    /**
    * Create a soundManager Sound object
    */
    createSound: function(url, id, title, artURL, album, artist) {
        id = id.toString();
        this.soundObject = soundManager.createSound({
            id: id,
            url: url,
            title: title
        });

        Artists.queueArray.push({
            id: id.toString(),
            title: title,
            art: artURL,
            album: album,
            artist: artist
        });
    },

    /**
    * Start playing the array of sounds in queue
    */
    playRecursive: function() {
        var that = this;

        // Recursive queue function.
        var chain = function (sound) {
            soundManager.play(sound,
                {
                    multiShotEvents: true,
                    whileplaying: function() {
                        $(".progBar").css('width', ((this.position / this.duration) * 100) + '%');
                        that.duration = this.durationEstimate;
                        that.playbacktime(this.position);
                    },

                    onplay: function() {
                        that.setSongInfoPanel();
                        that.listenForSeeking();
                        that.clickedPause();
                    },

                    onstop: function () {
                        that.nextSong();
                       if (Artists.queueArray[0] !== undefined) {
                            chain(Artists.queueArray[0].id);
                        }
                    },

                    onfinish: function () {
                       that.nextSong();
                       if (Artists.queueArray[0] !== undefined) {
                            chain(Artists.queueArray[0].id);
                        }
                    }
                })
            };

        // Start the chain function with first sound in array.
        chain(Artists.queueArray[0].id);
    },

    /**
    * Helper function for calculating the elapsed playback time and updating the shown playback time.
    */
    playbacktime: function(ms) {
        var s = Math.floor(ms / 1000),
            m = Math.floor(s / 60),
            d = m * 60,
            timeString = (s < 10) ?
                '0:0' + s        : (s < 60) ?
                '0:' + s         : (s-d < 10) ?
                m + ':0' + s-d   : m + ':' + s-d;

        $('#progress-time').html(timeString);
    },

    nextSong: function() {
        Artists.queueArray.shift();

        $('#nowplaying').empty();
        $('.upnext-list').empty();

        for (var i=1; i < Artists.queueArray.length; i++) {
            $('.upnext-list').append(
                    '<li id="song'+Artists.queueArray[i].id+'"><a>'+Artists.queueArray[i].title+'</a></li>'
                );
        }

        this.playing = false;

        $('#progress-time').empty();
        $('.progBar').css('width', '0%');
        $('#progress-bar').toggleClass('seek-position');
    },

    clickedPause: function() {
        $('.play-pause-button').click(function(e) {
            if ($('.play-pause-icon').hasClass('glyphicon-pause')) {
                $('.play-pause-icon').removeClass('glyphicon-pause')
                     .addClass('glyphicon-play');
            } else {
                $('.play-pause-icon').removeClass('glyphicon-play')
                     .addClass('glyphicon-pause');
            }

            soundManager.togglePause(Artists.queueArray[0].id);
        });
    },

    setSongInfoPanel: function() {
        var currentSong = Artists.queueArray[0];

        $('.play-pause-icon').removeClass('glyphicon-music').addClass('glyphicon-pause');
        $('.play-pause-button').css('background-image', 'url("'+currentSong.art+'")');

        $('#nowplaying').text(currentSong.title);
        $('#now-playing-album').text(currentSong.album);
        $('#now-playing-artist').text(currentSong.artist);
    },

    listenForSeeking: function() {
        var that = this;
        $('#progress-bar')
            .click(function(e) {
                var offset = $(this).offset(),
                    width = $(this).width();
                var clickedPosition = e.clientX - offset.left;
                var percentage = clickedPosition / width;
                var targetDuration = percentage * that.duration;
                soundManager.setPosition(Artists.queueArray[0].id, targetDuration);
            })
            .toggleClass('seek-position')
            .mousedown(function(e) {
                var offset = $(this).offset(),
                    width = $(this).width();
                var clickedPosition = e.clientX - offset.left;
                $('.progBar').width(clickedPosition);
                $(this).mousemove(function(e) {
                    var offset = $(this).offset(),
                        width = $(this).width();
                    var clickedPosition = e.clientX - offset.left;
                    $('.progBar').width(clickedPosition);
                });
            })
            .mouseup(function(e) {
                $(this).off('mousemove');
            })
            .mouseleave(function(e) {
                $(this).off('mousemove');
            });
    }
});
