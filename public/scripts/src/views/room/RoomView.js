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
      .on('disconnect', this.disconnect.bind(this))
      .on('reconnect', this.reconnect.bind(this));
  },

  start: function () {
    APP.user.name = localStorage.getItem('username');
    if (!APP.user.name) return APP.views.userFormView.render();
    this.joinRoom();
    APP.views.waitingRoomView.render();
  },

  joinRoom: function (recoverCallFromDisconnect) {
    APP.socket.emit('moviemime:room:join', {
      roomId: window.ROOM_ID,
      userAttributes: {
        name: APP.user.name,
        recoverCallFromDisconnect: recoverCallFromDisconnect,
      },
    });
  },

  reconnect: function () {
    APP.alert('Connexion retreived.', 'success');
    APP.collections.users.reset();
    this.joinRoom(true);
  },

  disconnect: function () {
    APP.alert('Connexion lost.', 'danger');
  },

  addUsers: function (params) {
    params.users.forEach(function (user) {
      APP.alert(user.name + ' was already there.', 'success');
    });
    APP.collections.users.add(params.users);
  },

  addUser: function (user) {
    APP.alert(user.name + ' joined.', 'success');
    APP.collections.users.add(user);
  },

  removeUser: function (id) {
    var user = APP.collections.users.get(id);
    APP.alert(user.attributes.name + ' left.', 'warning');
    APP.collections.users.remove(user);
  },

});
