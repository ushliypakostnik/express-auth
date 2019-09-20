import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import cors from 'cors';
import url from 'url';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-express-middleware';
import Backend from 'i18next-node-fs-backend';

import config from './config/config';

import User from './models/user'; // eslint-disable-line no-unused-vars
import passport from './config/passport'; // eslint-disable-line no-unused-vars
import router from './routes/index';

const app = express();

// Session config
app.use(session({
  secret: config.PASS.SECRET,
  cookie: { maxAge: 60000 },
  resave: false,
  rolling: true,
  saveUninitialized: false,
}));

// db url
const mongoDB = process.env.MONGOLAB_URI || config.PASS.DB.url;

// db connect
mongoose.connect(mongoDB, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// CORS
if (config.CORS_ENABLED) {
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
      callback(null, origin);
    }
  }

  app.use(cors(corsOptions));
}

// Static
if (config.STATIC_SERVE) {
  const mediaURL = new url.URL(config.MEDIA_URL);
  app.use(mediaURL.pathname, express.static(config.MEDIA_DIR));
}

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
      addPath: __dirname + '/locales/{{lng}}/{{ns}}.missing.json'
    },
    fallbackLng: 'en',
    preload: ['en', 'ru'],
    saveMissing: true,
    detection: {
      order: [ 'cookie' ],
      lookupCookie: 'language',
    },
  });

app.use(i18nextMiddleware.handle(i18next));

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

export default app;
