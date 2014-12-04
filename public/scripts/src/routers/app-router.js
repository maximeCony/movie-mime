'use strict';

var UserFormView = require('../views/user/user-form-view');

module.exports = Backbone.Router.extend({

  routes: {
    '': 'index',
    'user': 'user',
    'rooms': 'rooms',
  },

  start: function() {
    var username = localStorage.getItem('movie-share-username');
    if (!username || username === 'undefined') {
      Backbone.history.start({
        silent: window.location.hash !== '#user',
      });
      return APP.router.navigate('user', { trigger: true });
    }
    APP.models.user = new Backbone.Model({ username: username });
    Backbone.history.start();
  },

  index: function() {
    this.navigate('rooms', { trigger: true });
  },

  user: function() {
    APP.views.userFormView = new UserFormView().render();
  },

  rooms: function() {
    console.log('rooms');
  },

});