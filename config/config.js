import crypto from 'crypto';

import PASS from './pass';
import MESSAGES from './messages';

const env = process.env.NODE_ENV;

if (env === 'production') {
  require('dotenv').config();
}

const random = Number(process.env.RANDOM_BYTES) || PASS.RANDOM_BYTES;
const secret = crypto.randomBytes(random).toString('hex');

const common = {
  PORT: process.env.PORT || 8082,
  MEDIA_DIR: process.env.MEDIA_DIR || 'media',
  STATIC_SERVE: process.env.STATIC_SERVE || false,
  PASS: {
    RANDOM_BYTES: random,
    SECRET: secret,
    SALT_LENGTH: secret.length,
    DB: {
      url: process.env.DB_URL || PASS.DB.url,
    },
    EMAIL: {
      user: process.env.EMAIL_USER || PASS.EMAIL.user,
      pass: process.env.EMAIL_PASS || PASS.EMAIL.pass,
    },
    FACEBOOK: {
      id: process.env.FACEBOOK_APP_ID || PASS.FACEBOOK.id,
      secret: process.env.FACEBOOK_APP_SECRET || PASS.FACEBOOK.secret,
    },
    VKONTAKTE: {
      id: process.env.VKONTAKTE_APP_ID || PASS.VKONTAKTE.id,
      secret: process.env.VKONTAKTE_APP_SECRET || PASS.VKONTAKTE.secret,
    },
  },
  MESSAGES,
};

const development = {
  ...common,
  HOST: process.env.HOST || 'http://localhost:8082',
  MEDIA_URL: process.env.MEDIA_URL || 'http://localhost:8082/media',
  CORS_ENABLED: process.env.CORS_ENABLED || true,
};

const production = {
  ...common,
  HOST: process.env.HOST || 'https://express-auth.kafedra.org',
  MEDIA_URL: process.env.MEDIA_URL || 'https://express-auth.kafedra.org/media',
  CORS_ENABLED: process.env.CORS_ENABLED || false,
};

const config = {
  development,
  production,
};

export default config[env];
