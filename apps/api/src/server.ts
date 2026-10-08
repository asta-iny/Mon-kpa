import { createApp } from './app.js';

const { app, logger, env } = createApp();

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, appEnv: env.APP_ENV }, 'LibFind API listening');
});
