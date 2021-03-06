import { job } from 'cron';

import bot from './bot';
import { BIRTHDAY_NOTIFICATIONS_CRON, TZ } from './config';
import { findUsers } from './repos/user';
import { birthdaysForUser } from './services/user';
import { birthdayMessage } from './templates';

export const sendBirthdayNotifications = job({
  cronTime: BIRTHDAY_NOTIFICATIONS_CRON,
  timeZone: TZ,
  async onTick() {
    console.log('Running sendBirthdayNotifications...');
    for (const user of await findUsers()) {
      for (const birthday of await birthdaysForUser(user)) {
        bot.telegram.sendMessage(user.telegramId, birthdayMessage(birthday));
      }
    }
  },
});
