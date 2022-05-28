import Fastify from 'fastify';

import { createUserFromLogin } from './services/user';

const server = Fastify({
  logger: true,
});

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

export default server;
