import passport from 'passport';
import LocalStrategy from 'passport-local';

import User from '../models/user';

const local = new LocalStrategy({
  usernameField: 'user[usermail]',
  passwordField: 'user[password]',
}, (usermail, password, done) => {
  User.findOne({ usermail })
    .then((user) => {
      if (!user || !user.validatePassword(password)) {
        return done(null, false, { errors: { 'email or password': 'is invalid' } });
      }

      return done(null, user);
    }).catch(done);
});

passport.use(local);

export default passport;
