import passport from 'passport';
import LocalStrategy from 'passport-local';
import FacebookStrategy from 'passport-facebook';

import config from './config';

import User from '../models/user';

const VKontakteStrategy = require('passport-vkontakte').Strategy;


// For standard authentication
const local = new LocalStrategy({
  usernameField: 'user[usermail]',
  passwordField: 'user[password]',
}, (usermail, password, done) => {
  User.findOne({ usermail })
    .then((user) => {
      if (!user) {
        return done(null, false, { message: config.MESSAGES.validation_no_user });
      }
      if (user || !user.validatePassword(password)) {
        if (user.social) {
          return done(null, user, { error: config.MESSAGES.validation_social });
        }
        return done(null, false, { error: config.MESSAGES.validation_password_invalid });
      }
      return done(null, user);
    }).catch(done);
});

passport.use(local);


// For authentication via Facebook
const facebook = new FacebookStrategy({
  clientID: config.PASS.FACEBOOK.id,
  clientSecret: config.PASS.FACEBOOK.secret,
  callbackURL: `${config.HOST}/api/user/facebook/callback`,
  profileFields: [ 'email' ],
}, (accessToken, refreshToken, profile, done) => {
  const usermail = String(profile._json.email);
  User.findOne({ usermail })
    .then((user) => {
      return done(null, user, usermail);
    }).catch(done, false, usermail);
});

passport.use(facebook);

// For authentication via VKontakte
const vkontakte = new VKontakteStrategy({
  clientID: config.PASS.VKONTAKTE.id,
  clientSecret: config.PASS.VKONTAKTE.secret,
  callbackURL: `${config.HOST}/api/user/vkontakte/callback`,
  profileFields: [ 'email' ],
}, (accessToken, refreshToken, params, profile, done) => {
  let usermail = params.email;
  User.findOne({ usermail })
    .then((user) => {
      return done(null, user, usermail);
    }).catch(done, false, usermail);
});

passport.use(vkontakte);


export default passport;
