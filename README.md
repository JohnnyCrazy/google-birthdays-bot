# Google Birthdays Bot

Telegram bot, which sends out a daily digest of birthdays at that day. Source of the birthday data is google contacts/people. The API is accessed via OAuth2.

> Did you know Google has a special Birthday calendar, but doesn't provide a way to create notifications for them?!

## Requirements

- PostgreSQL
- DBmate
- Public-reachable webserver (for developing: localtunnel or ngrok)
- Telegram Bot API Key
- Google Project Credentials (Client ID, Client Secret, Redirect URL)

## Docker

A docker image is available via [johnnycrazy/google-birthdays-bot](https://hub.docker.com/r/johnnycrazy/google-birthdays-bot)

## Configuration

Configuration is done via environment variables. On development, `direnv` together with a `.env` is used. For a sample, checkout `.env.sample`

| **Key**                       | **Default**                                                                          | **Description**                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`          | -                                                                                    | Valid Telegram Bot API Token                                    |
| `GOOGLE_CLIENT_ID`            | -                                                                                    | Google Credentials Client ID                                    |
| `GOOGLE_CLIENT_SECRET`        | -                                                                                    | Google Credentials Client Secret                                |
| `GOOGLE_REDIRECT_URL`         | -                                                                                    | Google Credentails Redirect URL                                 |
| `JWT_SECRET`                  | -                                                                                    | Secret used for encrypting/decrypting JWT. Should be > 16 Chars |
| `PORT`                        | `3000`                                                                               | Port for the webserver, used for OAuth2 callbacks               |
| `DATABASE_URL`                | `postgresql://postgres:postgres@localhost:5432/google_birthdays_bot?sslmode=disable` | PostgreSQL Database connection string                           |
| `BIRTHDAY_NOTIFICATIONS_CRON` | `0 10 * * *`                                                                         | Cron when birthday notifications are sent to all users          |
| `TZ`                          | `Europe/Berlin`                                                                      | Timezone for the cron                                           |
| `DBMATE_MIGRATIONS_DIR`       | `db/migrations`                                                                      | Source of dbmate migrations, do not change                      |
| `DBMATE_SCHEMA_FILE`          | `db/schema.sql`                                                                      | Source of dbmate schema, do not change                          |
