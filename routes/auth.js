import jwt from 'express-jwt';

import config from '../config/config';

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;

  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

const auth = {
  required: jwt({
    secret: config.PASS.SECRET,
    getToken: getTokenFromHeaders,
  }),
  optional: jwt({
    secret: config.PASS.SECRET,
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
};

export default auth;
