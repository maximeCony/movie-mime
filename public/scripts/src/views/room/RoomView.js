'use strict';

var UserFormView = require('../user/UserFormView');
var WaitingRoomView = require('./WaitingRoomView');
var UsersView = require('../user/UsersView');
var FileHandlerView = require('./FileHandlerView');
var LocalVideoView = require('./LocalVideoView');

module.exports = Backbone.View.extend({

  initialize: function () {
    APP.views.userFormView = new UserFormView();
    APP.views.waitingRoomView = new WaitingRoomView();
    APP.views.usersView = new UsersView({
      collection: APP.collections.users,
    });
    APP.views.fileHandlerView = new FileHandlerView();
    APP.views.localVideoView = new LocalVideoView();
    APP.socket
      .on('moviemime:room:joined', this.addUsers.bind(this))
      .on('moviemime:room:newUser', this.addUser.bind(this))
      .on('moviemime:room:deleteUser', this.removeUser.bind(this))
      .on('reconnect', this.joinRoom.bind(this));
  },

  start: function () {
    APP.user.name = localStorage.getItem('username');
    if (!APP.user.name) return APP.views.userFormView.render();
    this.joinRoom();
    APP.views.waitingRoomView.render();
  },

  joinRoom: function () {
    APP.collections.users.reset();
    APP.socket.emit('moviemime:room:join', {
      roomId: window.ROOM_ID,
      userAttributes: { name: APP.user.name },
    });
  },

  addUsers: function (params) {
    APP.collections.users.add(params.users);
  },
  
  addUser: function (user) {
    APP.collections.users.add(user);
  },

  removeUser: function (id) {
    APP.collections.users.remove(id);
  },

});
