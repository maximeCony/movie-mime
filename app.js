'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var dustjs = require('adaro');
var socketModule = require('./server/modules/socket-module');
var roomModule = require('./server/modules/room-module');
var isProduction = process.env.NODE_ENV === 'production';

app.use('/public', express.static(__dirname + '/public'));

// dust
app.engine('dust', dustjs.dust({
  cache: isProduction,
}));
app.set('view engine', 'dust');
app.set('views', __dirname + '/server/views');

// parse body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routing
app.get('/', function(req, res) {
  res.render('index');
});
app.use(roomModule);
socketModule(io);

mongoose.connect('mongodb://localhost/movie-mime');
mongoose.connection
  .once('open', function() {
    http.listen(process.env.PORT, function() {
      console.log('listening on port '+ process.env.PORT);
    });
  })
  .on('error', console.error.bind(console, 'connection error:'));
