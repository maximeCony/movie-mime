'use strict';

module.exports = Backbone.View.extend({

  el: '#app',

  template: _.template($('#user-form-template').html()),

  events: {
    'click #js-saveUser': 'saveUser',
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  saveUser: function() {
    var username = this.$el.find('#username-input').val();
    localStorage.setItem('movie-mime-username', username);
    APP.router.navigate('rooms', { trigger: true });
  },

});