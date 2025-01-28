const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    googleId: profile.id,
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

