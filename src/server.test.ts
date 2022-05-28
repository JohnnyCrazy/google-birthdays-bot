import { expect, it, vi } from 'vitest';

import { buildServer } from './server';
import { createUserFromLogin } from './services/user';

vi.mock('./services/user');

it('GET /google/callback missingParameters', async () => {
  const server = buildServer();

  const { body, statusCode } = await server.inject({
    method: 'GET',
    path: '/google/callback',
  });

  expect(statusCode).toEqual(400);
  expect(body).toEqual('Missing query params');
  expect(createUserFromLogin).not.toHaveBeenCalled();
});

it('GET /google/callback allParameters', async () => {
  const server = buildServer();
  const state = 'state';
  const code = 'code';

  const { body, statusCode } = await server.inject({
    method: 'GET',
    path: '/google/callback',
    query: {
      state,
      code,
      scope: 'scope',
    },
  });

  expect(statusCode).toEqual(200);
  expect(body).toEqual('OK!');
  expect(createUserFromLogin).toHaveBeenCalledWith(state, code);
});
