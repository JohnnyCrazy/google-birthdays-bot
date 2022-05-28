import { people_v1 } from 'googleapis';
import { Markup, Telegraf } from 'telegraf';

import { TELEGRAM_BOT_TOKEN } from './config';
import { findUserByTelegramId } from './repos/user';
import { birthdaysForUser, userLoginURL } from './services/user';

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

export function birthdayMessage({
  birthday,
  person,
}: {
  birthday: people_v1.Schema$Birthday;
  person: people_v1.Schema$Person;
}) {
  const year = birthday.date?.year ? ` (${new Date().getFullYear() - birthday.date.year})` : '';

  return `🎂 It's ${person.names?.[0]?.displayName ?? 'Unkown'} birthday today${year}`;
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
