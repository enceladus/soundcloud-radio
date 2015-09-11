//////////////////////////////
//  SoundCloud Radio Web App Server
///////////////////////////////

//#region Imports 
var bodyParser = require("body-parser"),
  cors = require("cors"),
  config = require("config"),
  express = require("express"),
  flash = require('connect-flash'),
  http = require('http'),
  passport = require("passport"),
  session = require("express-session"),
  SoundCloudAPI = require("soundcloud-node"),
  SoundCloudStrategy = require("passport-soundcloud").Strategy,
  User = require('./User'),
  util = require('util');
//#endregion

//#region Host Config 
process.env.PWD = process.cwd();

var port =
  // the process.env.PORT variable is for the demo on heroku
  process.env.PORT || parseInt(config.get("Debug.port")),
  // determines whether we are on heroku or local
  env = process.env.NODE_ENV || 'development',
<<<<<<< HEAD
  // sets the callback for SoundCloud. Uses the variable in config/default.json
  callback = util.format("%s/auth/soundcloud/callback",
    config.get("SoundCloud.callbackHost"));

var app = express();
=======
  callback = "http://robotradio.herokuapp.com/auth/soundcloud/callback"; // process.env.NODE_ENV determines whether this is the heroku app
>>>>>>> deploy

// Files in the app folder are served staticly
app.all('*', function(req, res, next) {
  // makes things in the app folder requested from '/'
  app.use(express.static(process.env.PWD + '/app'));
  // makes bower components requested from '/bower_components'
  app.use('/bower_components', express.static(process.env.PWD + '/bower_components'));
  next();
});

var server = app.listen(port, function() {
  console.log('Listening on port %d', server.address().port);
});

//#region App Middleware
// Creates user sessions 
app.use(session({
  secret: 'SECRET',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
  type: 'application/vnd.api+json'
}));
app.use(flash());
app.use(cors());
app.use(passport.initialize());

//#endregion

//#endregion

//#region Passport Config
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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
//#endregion

//#region App Routing 

//#region Get Requests 
app.get('/auth/soundcloud/callback',
  passport.authenticate('soundcloud', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    console.log("soundcloud auth callback.");
    // Successful authentication, redirect home.
    if (req._passport.session.user != null) {

      res.redirect('/');
    }
    else {
      // user hasn't registered
      res.redirect('/login');
    }
  });
//#region SoundCloud API Requests 
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
  }
  else {
    res.send(null);
  }
});
//#endregion
//#endregion

//#region Post Requests 
app.post('/auth/soundcloud', passport.authenticate('soundcloud', {}));

//#region SoundCloud API Requests
app.post('/likeSong/:id', function(req, res) {
  var id = req.params.id;
  var credentials = {
    access_token: req._passport.session.user.client,
    user_id: req._passport.session.user.id
  }
  console.log("liking song: ", id);
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
    }
    else {
      res.send(null);
    }
  });
});
//#endregion

//#endregion

//#endregion
