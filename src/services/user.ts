import { people_v1 } from 'googleapis';
import jwt from 'jsonwebtoken';
import { User } from 'zapatos/schema';

import bot from '../bot';
import { JWT_SECRET } from '../config';
import { google, googleAuthUrl, googleClient } from '../google';
import { insertUser, updateUserById } from '../repos/user';

interface JWTLoginPayload {
  telegramId: number;
}

export function userLoginURL(telegramId: number) {
  const payload: JWTLoginPayload = {
    telegramId,
  };

  const state = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
  });

  return googleAuthUrl(state);
}

export async function createUserFromLogin(state: string, code: string) {
  const { telegramId } = jwt.verify(state, JWT_SECRET) as JWTLoginPayload;

  const client = googleClient();
  const { tokens, res } = await client.getToken(code);
  client.setCredentials(tokens);

  if (!tokens.access_token || !tokens.expiry_date || !tokens.refresh_token) {
    throw new Error(`Failed to get google tokens: ${JSON.stringify(res?.data)}`);
  }

  const user = await insertUser({
    googleAccessToken: tokens.access_token,
    googleRefreshToken: tokens.refresh_token,
    googleExpiryDate: new Date(tokens.expiry_date),
    telegramId,
  });

  const peopleClient = google.people({ version: 'v1', auth: client });
  const {
    data: { totalItems },
  } = await peopleClient.people.connections.list({ resourceName: 'people/me', personFields: 'birthdays' });

  bot.telegram.sendMessage(user.telegramId, `You're now logged in! We found ${totalItems} contacts.`);
}

export async function contactsForUser(
  user: User.JSONSelectable,
  filter?: (person: people_v1.Schema$Person, birthday: people_v1.Schema$Birthday) => boolean,
) {
  const client = await googleClientForUser(user);
  const peopleClient = google.people({ version: 'v1', auth: client });

  const people = [];
  // very weird behaviour, as soon as you add : undefined | string as types, TS is confused
  let pageToken = '';

  do {
    const { data } = await peopleClient.people.connections.list({
      pageToken: pageToken || undefined,
      resourceName: 'people/me',
      personFields: 'birthdays,names,phoneNumbers',
    });

    pageToken = data.nextPageToken ?? '';

    for (const person of data.connections ?? []) {
      const birthday = person.birthdays?.[0];
      if (birthday && (!filter || filter(person, birthday))) {
        people.push({ person, birthday });
      }
    }
  } while (pageToken);

  return people;
}

export function maybeRefreshGoogleToken(user: User.JSONSelectable) {
  if (new Date(user.googleExpiryDate) < new Date()) {
    return new Promise<User.JSONSelectable>((resolve, reject) => {
      const client = googleClient();
      client.setCredentials({ refresh_token: user.googleRefreshToken });

      client.refreshAccessToken(async (err, tokens) => {
        if (err || !tokens?.access_token || !tokens?.expiry_date || !tokens?.refresh_token) {
          return reject(err);
        } else {
          const updatedUser = await updateUserById(user.id, {
            googleAccessToken: tokens.access_token,
            googleExpiryDate: new Date(tokens.expiry_date),
            googleRefreshToken: tokens.refresh_token,
          });

          resolve(updatedUser);
        }
      });
    });
  }

  return Promise.resolve(user);
}

export async function googleClientForUser(user: User.JSONSelectable) {
  const { googleAccessToken } = await maybeRefreshGoogleToken(user);
  const client = googleClient();
  client.credentials.access_token = googleAccessToken;

  return client;
}

export async function birthdaysForUser(user: User.JSONSelectable, date: Date = new Date()) {
  const [day, month, year] = [date.getDate(), date.getMonth(), date.getFullYear()];
  return contactsForUser(user, (_person, { date }) => {
    return (date && date.day === day && date.month === month + 1) ?? false;
  });
}
