import { Router } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import url from 'url';
import i18next from 'i18next';

import auth from '../auth';
import passport from '../../config/passport';
import {
  sendVerifyEmail,
  sendPasswordRemindEmail,
} from '../../config/mailer';

import config from '../../config/config';

const router = Router();
const jsonParser = bodyParser.json();
const User = mongoose.model('User');


// POST standart login route (optional, everyone has access)
router.post('/login', auth.optional, jsonParser, (req, res, next) => {
  const { body: { user } } = req;
  const { origin } = req.headers;
  const { language } = req;

  // eslint-disable-next-line no-unused-vars
  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) return res.status(400).json({ message: req.t('auth_400') });

    // If the user is in the database
    if (passportUser) {

      // And the password is valid for this email
      if (!info) {
        return res.json({ user: passportUser.toAuthJSON() });
      }

      if (info.message === config.MESSAGES.validation_social) {
        const { usermail } = user;
        const { password } = user;
        const newPassword = passportUser.setNewPassword(password);

        User.findOneAndUpdate({ usermail },
          { $set: { password: newPassword } },
          { returnOriginal: false }, (error, notSocialUser) => { // eslint-disable-line no-unused-vars
            if (error) return res.status(400).json({ message: req.t('verify_400') });

            // console.log('Updated social user', notSocialUser);
            return res.status(200).json({ user: notSocialUser.toAuthJSON() });
          });
      }

      if (info.message === config.MESSAGES.validation_password_invalid) {
        return res.status(422).json({ message: req.t('validation_password_invalid') });
      }
    }

    // If the user is not in the database - register a new one
    const newUser = new User(user);
    newUser.setNewUser(user.password);

    return newUser.save()
      .then((response) => {
        const { usermail } = response;
        const userid = response._id; // eslint-disable-line no-underscore-dangle
        // console.log("We send a letter to verify the new account!", usermail, userid, origin, language);
        sendVerifyEmail(usermail, userid, origin, language);
        return res.json({ user: response.toAuthJSON() });
      })
      .catch(() => {
        // console.log("Failed to save new account!");
        return res.status(400);
      });
  })(req, res, next);
});


// GET login via Facebook route (optional, everyone has access)
router.get('/facebook', auth.optional, jsonParser,
  passport.authenticate('facebook'));

router.get('/facebook/callback', auth.optional, jsonParser, (req, res, next) => {
  const referer = req.header('Referer');
  const { language } = req;

  // eslint-disable-next-line no-unused-vars
  passport.authenticate('facebook', { session: false, scope : ['email'] }, (err, facebookUser, usermail) => {
    if (err) return res.redirect(`${referer}/login`);

    const newUser = new User({ usermail });
    if (!facebookUser) {
      // If the user is not in the database - register a new one
      newUser.setNewUser(null);

      newUser.save()
      .then((response) => {
        const userid = response._id; // eslint-disable-line no-underscore-dangle
        // console.log("We send a letter to verify the new account!", usermail, userid, referer, language);
        sendVerifyEmail(usermail, userid, referer, language);
      })
      .catch(() => {
        // console.log("Failed to save new account!");
        return res.status(400).json({ message: req.t('auth_400') });
      });
    }

    const user = facebookUser || newUser;
    const _user = user.toAuthJSON();
    const { token } = _user;
    res.redirect(`${referer}social?token=${token}`);
  })(req, res, next);
});


// GET login via Vkontakte route (optional, everyone has access)
router.get('/vkontakte', auth.optional, jsonParser,
  passport.authenticate('vkontakte' , { session: false, scope : [ 'email' ] }));

router.get('/vkontakte/callback', auth.optional, jsonParser, (req, res, next) => {
  const referer = req.header('Referer');
  const { language } = req;

  // eslint-disable-next-line no-unused-vars
  passport.authenticate('vkontakte', { session: false, scope : [ 'email' ] }, (err, vkontakteUser, usermail) => {
    if (err) return res.redirect(`${referer}/login`);

    const newUser = new User({ usermail });
    if (!vkontakteUser) {
      // If the user is not in the database - register a new one
      newUser.setNewUser(null);

      newUser.save()
      .then((response) => {
        const userid = response._id; // eslint-disable-line no-underscore-dangle
        // console.log("We send a letter to verify the new account!", usermail, userid, referer, language);
        sendVerifyEmail(usermail, userid, referer, language);
      })
      .catch(() => {
        // console.log("Failed to save new account!");
        return res.status(400).json({ message: req.t('auth_400') });
      });
    }

    const user = vkontakteUser || newUser;
    const _user = user.toAuthJSON();
    const { token } = _user;
    res.redirect(`${referer}social?token=${token}`);
  })(req, res, next);
});


// POST Send verification email
router.post('/send-verify-email', auth.required, jsonParser, (req, res, next) => {
  const { user: { id } } = req;
  const { origin } = req.headers;
  const { language } = req;

  User.findOne({ _id: id }, (err, user) => {
    if (err) return res.sendStatus(400);

    const { usermail } = user;
    const userid = user._id; // eslint-disable-line no-underscore-dangle
    // console.log("We are sending an email to verify your account!", usermail, userid, origin);
    sendVerifyEmail(usermail, userid, origin, language);
    return res.sendStatus(200);
  });
});


// POST Verify account
router.post('/verify', auth.optional, jsonParser, (req, res, next) => {
  const { id } = req.body;

  return User.findOneAndUpdate({ _id: id },
    { $set: { isVerify: true } },
    { returnOriginal: false }, (err, verifyUser) => { // eslint-disable-line no-unused-vars
      if (err) return res.status(400).json({ message: req.t('verify_400') });

      return res.status(200).json({ message: req.t('verify_200') });
    });
});


// POST Remind password
router.post('/remind', auth.optional, jsonParser, (req, res, next) => {
  const { body: { usermail } } = req;
  const { origin } = req.headers;
  const { language } = req;

  return User.findOne({ usermail }, (err, user) => {
    if (err) return res.sendStatus(400);

    if (!user) return res.status(422).json({ message: req.t('remind_pass_422') });

    const authUser = user.toAuthJSON();
    const userid = authUser.id; // eslint-disable-line no-underscore-dangle
    const { token } = authUser;
    // console.log("We send an email to recover the password for the account!", user);
    sendPasswordRemindEmail(usermail, userid, token, origin, language);
    return res.status(200).json({ message: req.t('remind_pass_200') });
  });
});


// POST Set new password
router.post('/password', auth.required, jsonParser, (req, res, next) => {
  const { body: { user: { id, password } } } = req;

  User.findOne({ _id: id }, (err, user) => {
    if (err) return res.status(400).json({ message: req.t('set_pass_400') });

    const newPassword = user.setNewPassword(password);
    return User.findOneAndUpdate({ _id: id },
      { $set: { password: newPassword } },
      { returnOriginal: false }, (error, passwordUser) => { // eslint-disable-line no-unused-vars
        if (err) {
          return res.status(400).json({ message: req.t('set_pass_400') });
        }

        return res.status(200).json({ message: req.t('set_pass_200') });
      });
  });
});


// GET User profile
router.get('/profile', auth.required, jsonParser, (req, res, next) => {
  const { user: { id } } = req;

  User.findOne({ _id: id }, (err, user) => {
    if (err) return res.sendStatus(400);

    // console.log("We send profile information for the account!", user);
    return res.json({ user: user.toProfileJSON() });
  });
});


// GET Logout
router.get('/logout', auth.required, (req, res, next) => {
  req.session.destroy();
  res.send(req.t('logout_success'));
  res.end();
});


export default router;
