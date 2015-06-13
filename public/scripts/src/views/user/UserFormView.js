'use strict';

var DustView = require('../components/DustView');

module.exports = DustView.extend({

  el: '#app',

  templateName: 'user/userForm.dust',

  events: {
    'submit form': 'saveUser',
  },

  saveUser: function (e) {
    e.preventDefault();
    var username = $(e.currentTarget).find('[name=username]').val();
    localStorage.setItem('username', username);
    APP.views.roomView.start();
  },

});
