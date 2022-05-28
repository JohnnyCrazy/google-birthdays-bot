import { expect, it, vi } from 'vitest';

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } from './config';
import { googleAuthUrl, googleClient } from './google';

vi.mock('./config');

it('googleAuthUrl.withoutState.returnsCorrectUrl', () => {
  const url = new URL(googleAuthUrl());

  expect(url.protocol).toBe('https:');
  expect(url.hostname).toBe('accounts.google.com');
  expect(url.pathname).toBe('/o/oauth2/v2/auth');
  expect(url.searchParams.get('access_type')).toBe('offline');
  expect(url.searchParams.get('scope')).toBe('https://www.googleapis.com/auth/contacts.readonly');
  expect(url.searchParams.get('include_granted_scopes')).toBe('true');
  expect(url.searchParams.get('state')).toBe('');
  expect(url.searchParams.get('response_type')).toBe('code');
  expect(url.searchParams.get('client_id')).toBe(GOOGLE_CLIENT_ID);
  expect(url.searchParams.get('redirect_uri')).toBe(GOOGLE_REDIRECT_URL);
});

it('googleAuthUrl.withState.includesState', () => {
  const url = new URL(googleAuthUrl('WhatUp'));

  expect(url.searchParams.get('state')).toBe('WhatUp');
});

it('googleClient.setsConfigCorrectly', () => {
  const client = googleClient();

  expect(client._clientId).toEqual(GOOGLE_CLIENT_ID);
  expect(client._clientSecret).toEqual(GOOGLE_CLIENT_SECRET);
});
