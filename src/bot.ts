import { Markup, Telegraf } from 'telegraf';

import { TELEGRAM_BOT_TOKEN } from './config';
import { findUserByTelegramId } from './repos/user';
import { birthdaysForUser, userLoginURL } from './services/user';
import { birthdayMessage } from './templates';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start(async (ctx) => {
  const user = await findUserByTelegramId(ctx.from.id);

  if (!user) {
    ctx.reply(
      'Youre new, please login below',
      Markup.inlineKeyboard([Markup.button.url('Google Login', userLoginURL(ctx.from.id))]),
    );
  }
});

bot.command('/today', async (ctx) => {
  const user = await findUserByTelegramId(ctx.from.id);

  if (user) {
    const birthdays = await birthdaysForUser(user);

    if (birthdays.length === 0) {
      return ctx.reply('No birthdays for today!');
    }

    for (const birthday of birthdays) {
      ctx.reply(birthdayMessage(birthday));
    }
  }
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
