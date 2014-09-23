var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
Backbone.$ = $;
var Artists = require('../collections/artists');
var app = app || {};

module.exports = Backbone.View.extend({
    tagName: 'li',
    events: {
        "click a": "selectSong"
    },

    /**
    * Renders link for song model
    */
    render: function() {
        // this.$el.html('')
        this.$el.html('<a href="#">' + this.model.title + '</a>');
        return this;
    },
    /**
    * When song link is clicked/selected, stop page jumping to top
    * Pass url of song file to playSong method
    */
    selectSong: function(e) {
        if (Artists.queueArray.length) {
            this.addSong(e);
        }
        else {
            this.addSong(e);
            this.playRecursive();
        }
        $('.upnext-list').empty();
        for (var i=1; i < Artists.queueArray.length; i++) {
            $('.upnext-list').append('<li id="song'+Artists.queueArray[i].id+'"><a>'+Artists.queueArray[i].title+'</a></li>');
        }
    },
    addSong: function(e){
        e.preventDefault();
        var url = this.getSongURL();
        var artURL = this.getArtURL(this.model.album_id);
        this.createSound(url, this.model.id, this.model.title, artURL, this.model.album, this.model.albumartist);
    },
    getArtURL: function(id) {
        return "/album/"+id+"/art";
    },
    /**
    * Returns url for song file
    */
    getSongURL: function() {
        console.log('getting song url');
        var url = '/item/' + this.model.id + '/file';
        return url
    },
    /**
    * Create a soundManager Sound object
    */
    createSound: function(url, id, title, artURL, album, artist) {
        console.log('creating the sound');
        id = id.toString();
        this.mySound = soundManager.createSound({
            id: id, // optional: provide your own unique id
            url: url,
            title: title
        });
        Artists.queueArray.push({id: id.toString(),title: title, art: artURL, album: album, artist: artist});
        console.log('this is the sound array');
        console.log(Artists.queueArray);
    },
    playRecursive: function() {
        var that = this;
        console.log(Artists.queueArray);
        var chain = function (sound) {
            soundManager.play(sound, {
                    multiShotEvents: true,
                    whileplaying: function() {
                        $(".progBar").css('width', ((this.position / this.duration) * 100) + '%');
                        that.duration = this.durationEstimate;
                        // this.playbacktime(this.position);
                        that.playbacktime(this.position);
                    },
                    onplay: function() {
                        that.seekingShit();
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
                })}
            chain(Artists.queueArray[0].id);
    },
    playbacktime: function(ms) {
        var timeString;
        var s = Math.floor(ms / 1000);
        var m = Math.floor(s / 60);
        var d = m * 60;
        var s_d = s - d;
        (s < 10) ?
            timeString = '0:0' + s : (s < 60) ?
            timeString = '0:' + s : (s_d < 10) ?
            timeString = m + ':0' + s_d : timeString = m + ':' + s_d

        $('#progress-time').html(timeString);
    },
    nextSong: function() {
        Artists.queueArray.shift();
        console.log(Artists.queueArray);
       // var index = Artists.queueArray.map(function(e) { return e.id; }).indexOf(sound);
        // var index = Artists.queueArray.indexOf(sound);
        $('#nowplaying').empty();
        $('.upnext-list').empty();
for (var i=1; i < Artists.queueArray.length; i++) {
            $('.upnext-list').append('<li id="song'+Artists.queueArray[i].id+'"><a>'+Artists.queueArray[i].title+'</a></li>');
        }
        this.playing = false;
        $('#progress-time').empty();
        $('.progBar').css('width', '0%');
        $('#progress-bar').toggleClass('seek-position');
    },
    clickedPause: function() {
        $('.play-pause-button').click(function(e) {
                console.log($('.play-pause-icon').hasClass('glyphicon-pause'));
                // $(this).html($(this).text() == '||' ? '►' : '||');
                if ($('.play-pause-icon').hasClass('glyphicon-pause')) {
                    $('.play-pause-icon').removeClass('glyphicon-pause')
                                         .addClass('glyphicon-play');
                }
                else {
                    $('.play-pause-icon').removeClass('glyphicon-play')
                                         .addClass('glyphicon-pause');
                }
                soundManager.togglePause(Artists.queueArray[0]);
                console.log('clicked pause');
            });
    },
    seekingShit: function() {
        var that = this;
        // window.nowPlaying = sound;
    // var index = Artists.queueArray.map(function(e) { return e.id; }).indexOf(window.nowPlaying);
    var title = Artists.queueArray[0].title;
    var art = Artists.queueArray[0].art;
    var album = Artists.queueArray[0].album;
    var artist = Artists.queueArray[0].artist;

    $('.play-pause-icon').removeClass('glyphicon-music').addClass('glyphicon-pause');
    $('#nowplaying').text(title);
    $('.play-pause-button').css('background-image', 'url("'+art+'")');
    $('#now-playing-album').text(album);
    $('#now-playing-artist').text(artist);
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
            that.seeking = true;
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
            that.seeking = false;
            $(this).off('mousemove');
        })
        .mouseleave(function(e) {
            that.seeking = false;
            $(this).off('mousemove');
        });
    }
});
