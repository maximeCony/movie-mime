'use strict';

var DustView = require('../components/DustView');

module.exports = DustView.extend({

  el: '#app',

  templateName: 'room/waitingRoom.dust',

  initialize: function () {
    this.listenTo(APP.collections.users, 'add', this.userAdded);
  },

  getDustContext: function() {
    var parser = document.createElement('a');
    parser.href = window.location.href;
    var link = parser.protocol + '//' + parser.hostname +
      (parser.port ? ':' + parser.port : '') +
      '/rooms/' + window.ROOM_ID;
    return { link: link };
  },

  rendered: function () {
    // auto-select
    this.$el.find('.js-shareableLink')
      .focus(function () { this.select(); })
      .mouseup(function () { return false; })
      .focus();
  },

  userAdded: function () {
    if (APP.collections.users.length > 1) {
      APP.views.fileHandlerView.render();
    }
  },

});
