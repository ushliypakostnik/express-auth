import express from 'express';
import nunjucks from 'nunjucks';
import mailer from 'express-mailer';

import config from './config';

const app = express();

// Apply Nunjucks.
const env = nunjucks.configure(['tmpl'], { // set folders with templates
  autoescape: true,
  express: app,
});
app.set('view engine', env);

mailer.extend(app, {
  from: 'no-reply@example.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: config.PASS.EMAIL.user,
    pass: config.PASS.EMAIL.pass,
  },
});

export const sendVerifyEmail = (email, id) => {
  app.mailer.send('pages/verify-email.html', {
    to: email,
    subject: 'Verify account',
    verifyLink: `${config.HOST}api/user/verify?id=${id}`,
  }, (err) => {
    if (err) {
      // console.log('Ошибка отправки письма для верификации!');
      console.log(err);
    } else {
      // console.log('Письмо для верификации отправлено!');
    }
  });
};

// ?key=value#token=${token}
export const sendPasswordRemindEmail = (email, id, token, client) => {
  let clientHost;
  if (process.env.NODE_ENV === 'production') {
     if (client = 'react') clientHost = config.CLIENT_HOST_REACT;
     if (client = 'vue') clientHost = config.CLIENT_HOST_VUE;
  } else {
    clientHost = config.CLIENT_HOST;
  }

  app.mailer.send('pages/remind-pass-email.html', {
    to: email,
    subject: 'Remind password',
    link: `${clientHost}password/?key=value#id=${id}&token=${token}`,
  }, (err) => {
    if (err) {
      // console.log('Ошибка отправки письма с напоминанием пароля!');
      console.log(err);
    } else {
      // console.log('Письмо с напоминанием пароля отправлено!');
    }
  });
};

export default mailer;
