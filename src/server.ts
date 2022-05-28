import Fastify, { FastifyServerOptions } from 'fastify';

import { createUserFromLogin } from './services/user';

export function buildServer(opts?: FastifyServerOptions) {
  const server = Fastify(opts);

  interface CallbackQuery {
    code?: string;
    scope?: string;
    state?: string;
  }

  server.get('/google/callback', async (req, reply) => {
    const { code, scope, state } = req.query as CallbackQuery;
    if (!code || !scope || !state) {
      reply.status(400).send('Missing query params');
      return;
    }

    await createUserFromLogin(state, code);
    reply.status(200).send('OK!');
  });

  return server;
}
