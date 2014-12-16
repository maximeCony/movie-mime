'use strict';

var UserFormView = require('../views/user/user-form-view'),
  RoomCollection = require('../collections/room-collection'),
  RoomsView = require('../views/room/rooms-view'),
  RoomView = require('../views/room/room-view');

module.exports = Backbone.Router.extend({

  routes: {
    '': 'index',
    'user': 'user',
    'rooms': 'rooms',
    'rooms/:roomId': 'room',
  },

  start: function() {
    this.listenToSocket();
    var username = localStorage.getItem('movie-share-username');
    if (!username || username === 'undefined') {
      Backbone.history.start({
        silent: window.location.hash !== '#user',
      });
      return this.navigate('user', { trigger: true });
    }
    APP.models.user = new Backbone.Model({ username: username });
    Backbone.history.start();
  },

  listenToSocket: function() {
    this.listenTo(APP.socket, 'room:joined', this.roomJoined.bind(this));
  },

  roomJoined: function(params) {
    this.navigate('rooms/' + params.roomId, { trigger:true });
  },

  index: function() {
    this.navigate('rooms', { trigger: true });
  },

  user: function() {
    APP.views.userFormView = new UserFormView().render();
  },

  rooms: function() {
    APP.collections.rooms = new RoomCollection();
    APP.views.roomsView = new RoomsView({
      collection: APP.collections.rooms,
    });
    APP.collections.rooms.fetch({ reset: true });
  },

  room: function(roomId) {
    var room = APP.collections.rooms.get(roomId);
    APP.views.roomView = new RoomView({
      model: room,
    }).render();
  },  

});