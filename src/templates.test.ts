import { expect, it } from 'vitest';

import { birthdayMessage } from './templates';

it('birthdayMessage.nothing', () => {
  const message = birthdayMessage({ birthday: {}, person: {} });

  expect(message).toBe("🎂 It's Unkown's birthday today");
});

it('birthdayMessage.displayName', () => {
  const message = birthdayMessage({ birthday: {}, person: { names: [{ displayName: 'Johnny' }] } });

  expect(message).toBe("🎂 It's Johnny's birthday today");
});

it('birthdayMessage.displayNameAndYear', () => {
  const message = birthdayMessage({
    birthday: {
      date: {
        year: new Date().getFullYear() - 25,
      },
    },
    person: { names: [{ displayName: 'Johnny' }] },
  });

  expect(message).toBe("🎂 It's Johnny's birthday today (25)");
});
