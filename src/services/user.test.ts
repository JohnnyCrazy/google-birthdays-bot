import jwt from 'jsonwebtoken';
import { expect, it, vi } from 'vitest';
import { User } from 'zapatos/schema';

import bot from '../bot';
import { JWT_SECRET } from '../config';
import * as google from '../google';
import { insertUser, updateUserById } from '../repos/user';
import * as user from './user';

const testUser: User.JSONSelectable = {
  id: '1',
  telegramId: 1000,
  googleRefreshToken: 'refresh_token',
  googleAccessToken: 'access_token',
  googleExpiryDate: '2050-12-12T20:20Z',
  createdAt: '2022-12-12T20:20Z',
  updatedAt: '2022-12-12T20:20Z',
};

vi.mock('../bot');

vi.mock('../repos/user', () => ({
  updateUserById: vi.fn().mockImplementation((id, user) => Promise.resolve(user)),
  insertUser: vi.fn().mockImplementation((user) =>
    Promise.resolve({
      id: 1,
      ...user,
    }),
  ),
}));

it('userLoginURL.works', async () => {
  const telegramId = 1000;

  const url = new URL(user.userLoginURL(telegramId));
  const state = url.searchParams.get('state');

  expect(state).toBeTruthy();
  expect(jwt.verify(state!, JWT_SECRET)).toContain({ telegramId });
});

it('createUserFromLogin.missingTokens', async () => {
  const telegramId = 1000;
  const state = jwt.sign({ telegramId }, JWT_SECRET);

  vi.spyOn(google, 'googleClient').mockImplementation(
    () =>
      ({
        getToken() {
          return Promise.resolve({ tokens: {} });
        },
      } as any),
  );

  await expect(user.createUserFromLogin(state, 'code')).rejects.toThrowError('google tokens');
});

it('createUserFromLogin.works', async () => {
  const telegramId = 1000;
  const state = jwt.sign({ telegramId }, JWT_SECRET);

  vi.spyOn(google, 'googleClient').mockImplementation(
    () =>
      ({
        getToken() {
          return Promise.resolve({
            tokens: {
              access_token: 'access_token',
              expiry_date: 1653815812000,
              refresh_token: 'refresh_token',
            },
          });
        },
        setCredentials() {},
        request() {
          return {
            data: {
              totalItems: 1000,
            },
          };
        },
      } as any),
  );

  await user.createUserFromLogin(state, 'code');

  expect(insertUser).toHaveBeenCalledWith({
    googleAccessToken: 'access_token',
    googleRefreshToken: 'refresh_token',
    googleExpiryDate: new Date(1653815812000),
    telegramId,
  });
  expect(bot.telegram.sendMessage).toBeCalledWith(telegramId, expect.stringContaining('logged in'));
});

it('contactsForUser.withoutFilter.works', async () => {
  const connections = [
    {},
    {
      birthdays: [
        {
          date: {
            day: 12,
            month: 12,
          },
        },
      ],
    },
  ] as const;

  vi.spyOn(google, 'googleClient').mockImplementation(
    () =>
      ({
        credentials: {
          access_token: 'access_token',
        },
        request() {
          return {
            data: {
              totalItems: 1000,
              connections,
            },
          };
        },
      } as any),
  );

  const contacts = await user.contactsForUser(testUser);
  expect(contacts).toHaveLength(1);
  expect(contacts[0]).toEqual({ birthday: connections[1].birthdays[0], person: connections[1] });
});

it('contactsForUser.withFilter.works', async () => {
  const connections = [
    {
      birthdays: [
        {
          date: {
            day: 11,
            month: 11,
          },
        },
      ],
    },
    {
      birthdays: [
        {
          date: {
            day: 12,
            month: 12,
          },
        },
      ],
    },
  ] as const;

  vi.spyOn(google, 'googleClient').mockImplementation(
    () =>
      ({
        credentials: {
          access_token: 'access_token',
        },
        request() {
          return {
            data: {
              totalItems: 1000,
              connections,
            },
          };
        },
      } as any),
  );

  const contacts = await user.contactsForUser(
    testUser,
    ({ birthday }) => birthday.date?.day === 12 && birthday?.date?.month === 12,
  );
  expect(contacts).toHaveLength(1);
  expect(contacts[0]).toEqual({ birthday: connections[1].birthdays[0], person: connections[1] });
});

it('maybeRefreshGoogleToken.refreshesIfExpired', async () => {
  const outdatedUser = { ...testUser, googleExpiryDate: '2000-12-12T20:20Z' } as const;

  vi.spyOn(google, 'googleClient').mockImplementation(
    () =>
      ({
        setCredentials: vi.fn(),
        refreshAccessToken: vi.fn().mockImplementation(async (callback) => {
          await callback(null, {
            access_token: 'new_access_token',
            expiry_date: 1653815812000,
            refresh_token: 'new_refresh_token',
          });
        }),
      } as any),
  );

  const updatedUser = await user.maybeRefreshGoogleToken(outdatedUser);

  expect(updateUserById).toHaveBeenCalledWith(outdatedUser.id, {
    googleAccessToken: 'new_access_token',
    googleExpiryDate: new Date(1653815812000),
    googleRefreshToken: 'new_refresh_token',
  });

  expect(updatedUser.googleAccessToken).toBe('new_access_token');
  expect(updatedUser.googleRefreshToken).toBe('new_refresh_token');
});

it('maybeRefreshGoogleToken.keepsIfNotExpired', async () => {
  const updatedUser = await user.maybeRefreshGoogleToken(testUser);

  expect(updatedUser).toEqual(testUser);
});
