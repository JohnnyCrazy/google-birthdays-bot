import { Pool } from 'pg';
import { conditions } from 'zapatos/db';

import { DATABASE_URL } from './config';

export * as db from 'zapatos/db';
export { conditions as cond };

export const pool = new Pool({
  connectionString: DATABASE_URL,
});
