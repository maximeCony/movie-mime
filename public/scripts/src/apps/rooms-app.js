'use strict';

window.$ = window.jQuery = require('jquery');

$(function() {

  window.bootstrap = require('bootstrap');
  window._ = require('underscore');
  window._ = require('underscore');
  window.Backbone = require('backbone');
  window.Backbone.$ = $;
  window.dust = require('dustjs-linkedin');
  require('dustjs-helpers');
  // load precompiled Dust templates 
  // from (/scripts/dist/templates/templates.js)
  window.LOAD_DUST_TEMPATES();

  var RoomsView = require('../views/room/rooms-view');
  var RoomCollection = require('../collections/room-collection');
  
  window.APP = {
    models: {},
    collections: {
      rooms: new RoomCollection(),
    },
    views: {},
  };

  APP.views.roomsView = new RoomsView({
    collection: APP.collections.rooms,
  });
  APP.collections.rooms.fetch({
    reset: true,
    error: function () {
      // TODO: alert
    },
  });
});