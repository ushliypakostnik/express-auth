import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import config from '../config/config';

// User Model

const { Schema } = mongoose;

const UserSchema = new Schema({
  usermail: { type: String, required: true, unique: true },
  username: String,
  password: String,
  isVerify: { type: Boolean, default: false },
  userdata: { type: Object, default: [] },
});

// eslint-disable-next-line func-names
UserSchema.methods.setNewUser = function (password) {
  // console.log('User set new user ', password);
  const salt = crypto.randomBytes(config.PASS.RANDOM_BYTES).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
  this.password = hash + salt;
  this.username = this.usermail.split('@')[0]; // eslint-disable-line prefer-destructuring
};

// eslint-disable-next-line func-names
UserSchema.methods.setNewPassword = function (password) {
  // console.log('User set new password ', password);
  const salt = crypto.randomBytes(config.PASS.RANDOM_BYTES).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
  return hash + salt;
};

// eslint-disable-next-line func-names
UserSchema.methods.validatePassword = function (password) {
  // console.log('User validate password ', password);
  const salt = this.password.slice(-1 * config.PASS.SALT_LENGTH);
  const hash = this.password.slice(0, -1 * config.PASS.SALT_LENGTH);
  const hashNew = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
  return hash === hashNew;
};

// eslint-disable-next-line func-names
UserSchema.methods.generateJWT = function () {
  // console.log('User generate JWT');
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this.id,
    usermail: this.usermail,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, config.PASS.SECRET);
};

// eslint-disable-next-line func-names
UserSchema.methods.toAuthJSON = function () {
  // console.log('User to Auth JSON');
  return {
    id: this.id,
    usermail: this.usermail,
    token: this.generateJWT(),
  };
};

// eslint-disable-next-line func-names
UserSchema.methods.toProfileJSON = function () {
  // console.log('User to Profile JSON ');
  return {
    id: this.id,
    usermail: this.usermail,
    username: this.username,
    userdata: this.userdata,
    isVerify: this.isVerify,
  };
};

const User = mongoose.model('User', UserSchema);

export default User;
