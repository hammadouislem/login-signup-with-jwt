
const passport = require('passport');
const GitHubStrategy = require("passport-github2").Strategy;
require('dotenv').config();
const axios = require("axios");


passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/auth/github/callback',
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    githubId: profile.id,
    name: profile.displayName,
    email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : "no-email-provided",
    image: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "no-image",
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

