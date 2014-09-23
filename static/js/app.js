var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
appRouter = require('./routers/router');
var ArtistListView = require('./views/artistlistview');
var Artists = require('./collections/artists');

var app = app || {};

$(document).ready(function() {
    Backbone.eventBus = _.extend({}, Backbone.Events);
    new appRouter();
    Backbone.history.start();
        app.view = new ArtistListView({collection: Artists});
});