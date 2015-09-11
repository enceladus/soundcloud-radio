/**
 *
 */

process.env.PWD = process.cwd();
var express = require("express"),
  app = express(),
  passport = require("passport"),
  SoundCloudStrategy = require("passport-soundcloud").Strategy,
  util = require('util'),
  bodyParser = require("body-parser"),
  flash = require('connect-flash'),
  http = require('http'),
  session = require("express-session"),
  User = require('./User'),
  SoundCloudAPI = require("soundcloud-node"),
config = require("config");

var port = process.env.PORT || parseInt(config.get("Debug.port")), // the process.env.PORT variable is for the demo on heroku
  env = process.env.NODE_ENV || 'development',
  callback = 
    "http://robotradio.herokuapp.com/auth/soundcloud/callback"; // process.env.NODE_ENV determines whether this is the heroku app

//Files in the public folder are served staticly
app.all('*', function(req, res, next) {
  app.use(express.static(process.env.PWD + '/app'));
  app.use('/bower_components', express.static(process.env.PWD + '/bower_components'));
  allowCrossDomain(req,res,next);
  next();
});
// configure app
// for allowing cross domain access from tumblr. May be unneccesary
var allowCrossDomain = function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
}

app.get('/', function(req, res) {
  res.sendFile(process.env.PWD + '/app/index.html');
});

passport.use(new SoundCloudStrategy({
    clientID: config.get("SoundCloud.clientId"),
    clientSecret: config.get("SoundCloud.clientSecret"),
    callbackURL: callback
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({
      method: "soundcloud",
      soundCloudId: profile.id,
      soundCloudToken: accessToken,
      soundCloudSecret: refreshToken
    }, function(err, user) {
      return done(err, user);
    });
  }
));




// Creates user sessions (not really implemented yet)
app.use(session({
  secret: 'SECRET',
  resave: true,
  saveUninitialized: true
}));
// For auth
app.use(passport.initialize());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
  type: 'application/vnd.api+json'
}));
app.use(flash());

var server = app.listen(port, function() {
  console.log('Listening on port %d', server.address().port);
});

app.get('/auth/soundcloud/callback',
  passport.authenticate('soundcloud', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    console.log("soundcloud auth callback.");
    // Successful authentication, redirect home.
    if (req._passport.session.user != null) {

      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });

app.get("/auth/soundcloud/loggedinuser", function(req, res) {
  if (req._passport.session.user) {
    var userUrl = util.format("http://api.soundcloud.com/users/%s?client_id=%s",
      req._passport.session.user.id, config.get("SoundCloud.clientId"));
    http.get(userUrl, function(userRes) {
      var str = '';
      userRes.on('data', function(chunk) {
        str += chunk;
      });
      userRes.on('end', function() {
        res.send(JSON.parse(str));
      });
    }).on('error', function(e) {
      console.log("error getting soundcloud user data");
      res.send(null);
    });
  } else {
    res.send(null);
  }
});

app.post('/auth/soundcloud', passport.authenticate('soundcloud', {

}));

app.post('/likeSong/:id', function(req, res) {
  var id = req.params.id;
  var credentials = {
    access_token: req._passport.session.user.client,
		user_id: req._passport.session.user.id
  }
	console.log("liking song: ",id);
  var client = new SoundCloudAPI(
		config.get("SoundCloud.clientId"),
		config.get("SoundCloud.clientSecret"),
		callback,
		credentials
	);
	console.log(client);
  var action = util.format("/me/favorites/%s", id);
  client.put(action, function(data) {
		console.log(data);
    if (data.err) {
      console.log(err);
      res.send(err);
    } else {
      res.send(null);
    }
  });
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
