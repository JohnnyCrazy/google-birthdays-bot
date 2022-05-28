import 'source-map-support';

import bot from './bot';
import { PORT } from './config';
import { sendBirthdayNotifications } from './cron';
import { buildServer } from './server';

async function bootstrap() {
  buildServer({ logger: true }).listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HTTP Server listening on ${PORT}`);
  });

  // telegram bot
  // we dont want to process old messages, rate limit stuff
  bot.launch({ dropPendingUpdates: true });

  // launch cron jobs
  sendBirthdayNotifications.start();
}

bootstrap();
