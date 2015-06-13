'use strict';

var UserView = require('./UserView');

module.exports = Backbone.View.extend({

  el: '.js-users',

  initialize: function () {
    this.listenTo(this.collection, 'add', this.addOne);
  },

  addOne: function (model) {
    // only render other users
    if (model.id === APP.socket.id) return;
    var view = new UserView({ model: model });
    this.$el.append(view.render().$el.fadeIn());
  },

});
