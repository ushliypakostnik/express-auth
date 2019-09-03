const MESSAGES = {
  auth_400: { message: 'Authentication / Registration failed' },
  auth_422: { message: 'Email password pair incorrect' },
  verify_200: { message: 'Account is verify' },
  verify_400: { message: 'Failed to verify account' },
  remind_pass_422: { message: 'No such user' },
  remind_pass_200: { message: 'Letter to the specified address sent' },
  set_pass_400: { message: 'Failed to save password' },
};

export default MESSAGES;
