const MESSAGES = {
  auth_400: 'Authentication / Registration failed',
  auth_422:'Email password pair incorrect',
  verify_200: 'Account is verify',
  verify_400: 'Failed to verify account',
  remind_pass_422: 'No such user',
  remind_pass_200: 'Letter to the specified address sent',
  set_pass_400: 'Failed to save password',
  set_pass_200: 'Password changed successfully',
  validation_no_user: 'There is no such user',
  validation_social: 'You used to go through a social network',
  validation_password_invalid: 'Password is invalid',
};

export default MESSAGES;
