const MESSAGES = {
  auth_400: { message: 'Authentication / Registration failed' },
  auth_422: { message: 'Email password pair incorrect' },
  verify_200: { message: 'Account is verify' },
  verify_400: { message: 'Failed to verify account' },
  remind_pass_422: { message: 'No such user' },
  remind_pass_200: { message: 'Letter to the specified address sent' },
  set_pass_400: { message: 'Failed to save password' },
  validation_no_user: { message: 'There is no such user' },
  validation_social: { message: 'You used to go through a social network' },
  validation_password_invalid: { message: 'Password is invalid' },
};

export default MESSAGES;
