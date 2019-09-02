import app from './app';

import config from './config/config';

// Server
app.listen(config.PORT, () => {
  console.log(`App listening on port ${config.PORT}!`);
});
