import { Router } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

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

const getClientHost = (header) => {
  const client = header.split(' ')[1];
  let clientHost;
  if (process.env.NODE_ENV === 'production') {
     if (client = 'react') {
       clientHost = config.CLIENT_HOST_REACT;
     } else if (client = 'vue') {
       clientHost = config.CLIENT_HOST_VUE;
     }
  } else {
    clientHost = config.CLIENT_HOST_DEV;
  }
  return clientHost;
};

// POST login route (optional, everyone has access)
router.post('/login', auth.optional, jsonParser, (req, res, next) => {
  const { body: { user } } = req;
  const { client } = req.headers;

  // eslint-disable-next-line no-unused-vars
  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) return next(err);

    // Если пользователь есть в базе и пароль валидный для этого email
    if (passportUser) {
      return res.json({ user: passportUser.toAuthJSON() });
    }

    if (!passportUser && info) {
      const { usermail } = user;
      User.findOne({ usermail }, (error, result) => { // eslint-disable-line consistent-return
        if (error) return res.status(400).json({ errors: config.MESSAGES.auth_400 });

        // Не валидный пароль для этого email
        if (result) {
          return res.status(422).json({ error: config.MESSAGES.auth_422 });
        }
      });
    }

    // Если пользователя нет в базе - регистрируем нового
    const newUser = new User(user);
    newUser.setNewUser(user.password);

    return newUser.save()
      .then((response) => {
        const { usermail } = response;
        const userid = response._id; // eslint-disable-line no-underscore-dangle
        // console.log("Отправляем письмо для верификации нового аккаунта!", usermail, userid);
        sendVerifyEmail(usermail, userid, client);
        res.json({ user: response.toAuthJSON() });
      })
      .catch(() => {
        // console.log("Не удалось сохранить новый аккаунт!");
        res.status(400).json({ error: config.MESSAGES.auth_400 });
      });
  })(req, res, next);
});

// POST Send verification email
router.post('/send-verify-email', auth.required, jsonParser, (req, res) => {
  const { user: { usermail } } = req;
  const { client } = req.headers;

  User.findOne({ usermail }, (err, user) => {
    if (err) return res.sendStatus(400);

    const userid = user._id; // eslint-disable-line no-underscore-dangle
    // console.log("Отправляем письмо для верификации аккаунта!", usermail, userid);
    sendVerifyEmail(usermail, userid, client);
    return res.sendStatus(200);
  });
});

// GET Verify account
router.get('/verify', auth.optional, jsonParser, (req, res) => {
  const { client } = req.query;

  User.findOne({ _id: req.query.id }, (err, user) => {
    if (err) return res.sendStatus(400);

    const { usermail } = user;
    return User.findOneAndUpdate({ usermail },
      { $set: { isVerify: true } },
      { returnOriginal: false }, (error, verifyUser) => { // eslint-disable-line no-unused-vars
        if (error) return res.sendStatus(400);

        return res.redirect(`${getClientHost(client)}`);
      });
  });
});

// POST Remind password
router.post('/remind', auth.optional, jsonParser, (req, res) => {
  const { body: { usermail } } = req;
  const { client } = req.headers;

  return User.findOne({ usermail }, (err, user) => {
    if (err) {
      return res.sendStatus(400);
    }

    if (!user) {
      return res.status(422).json({ error: config.MESSAGES.remind_pass_422 });
    }

    const authUser = user.toAuthJSON();
    const userid = authUser.id; // eslint-disable-line no-underscore-dangle
    const { token } = authUser;
    // console.log("Отправляем письмо для востановления пароля для аккаунта!", user);
    sendPasswordRemindEmail(usermail, userid, token, getClientHost(client));
    return res.status(200).json({ success: config.MESSAGES.remind_pass_200 });
  });
});

// POST Set new password
router.post('/password', auth.optional, jsonParser, (req, res) => {
  const { body: { user: { id, password } } } = req;

  User.findOne({ _id: id }, (err, user) => {
    if (err) {
      return res.status(400).json({ error: config.MESSAGES.set_pass_400 });
    }

    const newPassword = user.setNewPassword(password);
    return User.findOneAndUpdate({ _id: id },
      { $set: { password: newPassword } },
      { returnOriginal: false }, (error, passwordUser) => { // eslint-disable-line no-unused-vars
        if (err) {
          return res.status(400).json({ success: config.MESSAGES.set_pass_400 });
        }

        return res.sendStatus(200);
      });
  });
});

// GET User profile
router.get('/profile', auth.required, jsonParser, (req, res) => {
  const { user: { usermail } } = req;
  User.findOne({ usermail }, (err, user) => {
    if (err) return res.sendStatus(400);

    // console.log("Отправляем данные профиля для аккаунта!", user);
    return res.json({ user: user.toProfileJSON() });
  });
});

// GET Logout
router.get('/logout', auth.required, (req, res) => {
  req.session.destroy();
  res.send('logout success!');
});

export default router;
