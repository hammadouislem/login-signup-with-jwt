const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

require('dotenv').config();

const app = express();

app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
  clientID: process.env.FB_APP_ID,
  clientSecret: process.env.FB_APP_SECRET,
  callbackURL: 'https://f7ed-41-109-252-163.ngrok-free.app/api/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'email']
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    facebookId: profile.id,
    name: profile.displayName,
    email: profile.emails ? profile.emails[0].value : 'no-email-provided',
    image: profile.photos ? profile.photos[0].value : 'no-image',
  };

  console.log(user);

  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = app;
