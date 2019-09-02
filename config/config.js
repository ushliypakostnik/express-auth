import crypto from 'crypto';

import PASS from './pass';
import MESSAGES from './messages';

require('dotenv').config();

const env = process.env.NODE_ENV;

PASS.SECRET = crypto.randomBytes(PASS.RANDOM_BYTES).toString('hex');
let length;
if (process.env.SECRET) {
  length = process.env.SECRET.length; // eslint-disable-line prefer-destructuring
} else length = null;

const common = {
  PORT: process.env.PORT || 8082,
  MEDIA_DIR: process.env.MEDIA_DIR || 'media',
  STATIC_SERVE: false,
  PASS: {
    RANDOM_BYTES: process.env.RANDOM_BYTES || PASS.RANDOM_BYTES,
    SECRET: process.env.SECRET || PASS.SECRET,
    SALT_LENGTH: length || PASS.SECRET.length,
    DB: {
      url: process.env.DB_URL || PASS.DB.url,
    },
    EMAIL: {
      user: process.env.EMAIL_USER || PASS.EMAIL.user,
      pass: process.env.EMAIL_PASS || PASS.EMAIL.pass,
    },
  },
  MESSAGES,
};

const development = {
  ...common,
  HOST: process.env.HOST || 'http://127.0.0.1:8082',
  CLIENT_HOST_DEV: process.env.CLIENT_HOST_DEV || 'http://localhost:3000',
  MEDIA_URL: process.env.MEDIA_URL || 'http://127.0.0.1:8082/media',
  CORS_ENABLED: true,
};

const production = {
  ...common,
  HOST: process.env.HOST || 'http://www.yourserver',
  CLIENT_HOST_REACT: process.env.CLIENT_HOST_REACT || 'https://react-auth.firebaseapp.com',
  CLIENT_HOST_VUE: process.env.CLIENT_HOST_VUE || 'https://vue-auth.firebaseapp.com',
  MEDIA_URL: process.env.MEDIA_URL || 'http://www.yourserver.com/media',
  CORS_ENABLED: false,
};

const config = {
  development,
  production,
};

export default config[env];
