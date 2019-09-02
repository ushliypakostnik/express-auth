import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import cors from 'cors';
import url from 'url';

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
  app.use(cors());
}

// Static
if (config.STATIC_SERVE) {
  const mediaURL = new url.URL(config.MEDIA_URL);
  app.use(mediaURL.pathname, express.static(config.MEDIA_DIR));
}

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

export default app;
