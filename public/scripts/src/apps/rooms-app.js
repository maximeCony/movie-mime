'use strict';

$(function() {

  window._ = require('underscore');
  window.Backbone = require('backbone');
  window.dust = require('dustjs-linkedin');
  require('dustjs-helpers');

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
  APP.collections.rooms.fetch({ reset: true });
});