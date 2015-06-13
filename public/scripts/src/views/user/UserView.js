'use strict';

var DustView = require('../components/DustView');

module.exports = DustView.extend({

  templateName: 'user/user.dust',

  initialize: function () {
    this.listenTo(this.model, 'remove', this.remove);
  },

  getDustContext: function() {
    return {
      user: this.model.toJSON(),
    };
  },

});
