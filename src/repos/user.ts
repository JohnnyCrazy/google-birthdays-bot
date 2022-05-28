import { User } from 'zapatos/schema';

import { db, pool } from '../db';

export function findUsers() {
  return db.select('User', {}).run(pool);
}

export function findUserByTelegramId(telegramId: number) {
  return db.selectOne('User', { telegramId }).run(pool);
}

export function insertUser(user: User.Insertable) {
  return db.insert('User', { ...user }).run(pool);
}

export function findUserById(id: string) {
  return db.selectOne('User', { id }).run(pool);
}

export async function updateUserById(id: string, data: User.Updatable) {
  const [user] = await db.update('User', data, { id }).run(pool);
  return user;
}
