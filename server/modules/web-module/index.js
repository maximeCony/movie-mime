'use strict';

var express = require('express');
var router = express.Router();

var renderIndex = function (req, res) {
  res.render('index');
};

var renderRoom = function (req, res) {
  res.render('room', {
    roomId: req.params.room_id,
  });
};

router
  .route('')
  .get(renderIndex);

router
  .route('/rooms/:room_id')
  .get(renderRoom);

module.exports = router;
