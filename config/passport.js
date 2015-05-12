"use strict";
var passport = require("passport"),
    ExampleStrategy = require("./passport-itb/strategy").Strategy,
    oauthConfig = require("./oauth-config"),
    pConf = oauthConfig.provider,
    lConf = oauthConfig.consumer,
    // for Ward Steward 
    opts = require("./oauth-consumer-config")
    ;


var mongoose = require("mongoose"),
    User = mongoose.model("User")
    ;

  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.  However, since this example does not
  //   have a database of user records, the complete Facebook profile is serialized
  //   and deserialized.
  passport.serializeUser(function(user, done) {
    //TODO serialize only id
    //done(null, user);
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    //TODO deserialize id to user
    //var user = obj;
    //done(null, user);
    User
      .findOne({ _id: id })
      .exec(function (err, user) {
        done(err, user);
      });
  });

  passport.use(new ExampleStrategy({
      // see https://github.com/jaredhanson/oauth2orize/blob/master/examples/all-grants/db/clients.js
      clientID: opts.clientId,
      clientSecret: opts.clientSecret,
      callbackURL: lConf.protocol + "://" + lConf.host + "/auth/example-oauth2orize/callback"
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({uid : profile.id}, function(err, user){
          if (!user) {
            //New User
            var _user = new User({
              //domain: "itbconsult.com",
              uid: profile.id,
              profile: profile._json
            });
            var t = { kind: "oauth2", token: accessToken, attributes: { tokenSecret: refreshToken } };
            _user.tokens.push(t);
            _user.save(function (err) {
              if (err) console.log("save user error : "+err);
              return done(err, _user);
            });
          }else {
            //Update User
            user.profile = profile._json;
            var tokens = [{ kind: "oauth2", token: accessToken, attributes: { tokenSecret: refreshToken } }];
            user.tokens = tokens;
            user.save(function (err) {
              if (err) console.log(err);
              return done(err, user);
            });
          }
      });
    }
  ));