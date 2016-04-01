var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// connect to mongodb
mongoose.connect('mongodb://localhost/iotdb', function(err) {
    if (err) throw err;
    console.log("Successfully connnected to mongodb");
});

var user = require('./models/users');
var dataset = require('./models/datasets');

// Loading routes
var routes = require('./routes/index');
var users = require('./routes/users');
var datasets = require('./routes.datasets');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// we use mongodb to store session info
// expiration of the session is set to 7 days (ttl option)
app.use(session({
    store: new MongoStore({mongooseConnection: mongoose.connection, ttl: 7*24*60*60}),
    saveUninitialized: true,
    resave: true,
    secret: "SecretKey"
}));

// used to manipulate post requests and recongize PUT and DELETE operations
app.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && 'method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

// Register routes
app.use('/', routes);
app.use('/users', users);
app.use('/datasets', datasets);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
