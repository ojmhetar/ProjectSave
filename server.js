var express  = require('express');
var app      = express();
var port     = process.env.PORT || 9100;
var passport = require('passport');
var flash    = require('connect-flash');
var morgan   = require('morgan');
var request = require('request');
var sendgrid = require('sendgrid');


var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var connection = require('./config/db.js');

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); 

app.use(session({
    secret: process.env.SGUSER,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());

require('./config/passport')(passport, connection);

require('./app/routes.js')(app, passport, connection, request, sendgrid);


app.listen(port);
console.log('The magic happens on port ' + port);