import { expect, it, vi } from 'vitest';
import { User } from 'zapatos/schema';

import bot from './bot';
import { sendBirthdayNotifications } from './cron';
import { Contact } from './services/user';

vi.mock('./config');

vi.mock('./bot');

vi.mock('./repos/user', () => ({
  async findUsers(): Promise<User.JSONSelectable[]> {
    return [
      {
        createdAt: '2022-12-12T20:20Z',
        googleAccessToken: '',
        googleExpiryDate: '2022-12-12T20:20Z',
        googleRefreshToken: '',
        id: '1',
        telegramId: 1000,
        updatedAt: '2022-12-12T20:20Z',
      },
    ];
  },
}));

vi.mock('./services/user', () => ({
  birthdaysForUser(_user: User.JSONSelectable): Promise<Contact[]> {
    return Promise.resolve([
      {
        person: {
          names: [{ displayName: 'Johnny' }],
        },
        birthday: {
          date: {
            day: 12,
            month: 12,
            year: new Date().getFullYear(),
          },
        },
      },
    ]);
  },
}));

it('sendBirthdayNotifications.sendsOutMessages', async () => {
  sendBirthdayNotifications.fireOnTick();

  // fireonTick is not async, we need to wait manually
  await new Promise((resolve) => setTimeout(resolve, 1));

  expect(bot.telegram.sendMessage).toHaveBeenCalledWith(1000, expect.stringContaining('Johnny'));
});
