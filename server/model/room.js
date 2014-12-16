'use strict';

var mongoose = require('mongoose');

var shema = mongoose.Schema({
  name: String,
  password: String,
});

module.exports = mongoose.model('Room', shema);