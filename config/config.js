import crypto from 'crypto';

import PASS from './pass';
import MESSAGES from './messages';

require('dotenv').config();

const env = process.env.NODE_ENV;

const secret = crypto.randomBytes(PASS.RANDOM_BYTES).toString('hex');

const common = {
  PORT: process.env.PORT || 8082,
  MEDIA_DIR: process.env.MEDIA_DIR || 'media',
  STATIC_SERVE: false,
  PASS: {
    RANDOM_BYTES: process.env.RANDOM_BYTES || PASS.RANDOM_BYTES,
    SECRET: secret,
    SALT_LENGTH: secret.length,
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
  CLIENT_HOSTS_DEV: process.env.CLIENT_HOST_DEV || 'http://localhost:3000',
  MEDIA_URL: process.env.MEDIA_URL || 'http://127.0.0.1:8082/media',
  CORS_ENABLED: true,
};

const production = {
  ...common,
  HOST: process.env.HOST || 'http://express-auth.kafedra.org',
  CLIENT_HOST_REACT: process.env.CLIENT_HOST_REACT || 'http://react-auth.kafedra.org',
  CLIENT_HOST_VUE: process.env.CLIENT_HOST_VUE || 'http://vue-auth.kafedra.org',
  MEDIA_URL: process.env.MEDIA_URL || 'http://express-auth.kafedra.org/media',
  CORS_ENABLED: false,
};

const config = {
  development,
  production,
};

export default config[env];
