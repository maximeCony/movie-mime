'use strict';

var RoomModel = require('../models/room-model');

module.exports = Backbone.Collection.extend({

  model: RoomModel,

  url: 'rooms',

});