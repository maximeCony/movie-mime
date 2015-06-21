'use strict';

var DustView = require('./DustView');

module.exports = DustView.extend({

  templateName: 'components/alert.dust',

  className: 'alert',

  initialize: function(options) {
    this.options = options || {};
  },

  getDustContext: function() {
    return {
      alert: {
        type: this.options.type,
        message: this.options.message,
      },
    };
  },

  rendered: function() {
    if (this.options.timeout !== false) {
      setTimeout(this.dismiss.bind(this), this.options.timeout || 4000);
    }
  },

  dismiss: function() {
    this.$el.fadeOut(1000, this.remove.bind(this));
  },

});