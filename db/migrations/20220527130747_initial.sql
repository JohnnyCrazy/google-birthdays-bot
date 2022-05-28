-- migrate:up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "User" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  "telegramId" bigint UNIQUE NOT NULL,
  "googleRefreshToken" text NOT NULL,
  "googleAccessToken" text NOT NULL,
  "googleExpiryDate" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT NOW(),
  "updatedAt" timestamptz NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE IF EXISTS "User";

