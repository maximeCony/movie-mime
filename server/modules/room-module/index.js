'use strict';

var express = require('express');
var router = express.Router();
var shortid = require('shortid');
var redis = require('redis');
var client = redis.createClient();
var day = 24 * 60 * 60;

var createRoom = function(req, res, next) {
  var id = shortid.generate();
  var key = 'mm:room:' + id;
  var room = {
    // TODO: add password
    created_at: new Date(),
  };
  client.set(key, JSON.stringify(room), function (err) {
    if (err) return next(err);
    client.expire(key, day, function (err) {
      if (err) return next(err);
      res.json({ id: id });
    });
  });
};

var renderRoom = function (req, res) {
  res.render('room', {
    roomId: req.params.room_id,
  });
};

router
  .route('/api/rooms')
  .post(createRoom);

router
  .route('/rooms/:room_id')
  .get(renderRoom);

module.exports = router;
