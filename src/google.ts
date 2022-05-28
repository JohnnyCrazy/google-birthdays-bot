import { google } from 'googleapis';

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } from './config';

export const scope = ['https://www.googleapis.com/auth/contacts.readonly'];

export function googleAuthUrl(state?: string) {
  return googleClient().generateAuthUrl({
    access_type: 'offline',
    scope,
    include_granted_scopes: true,
    state,
  });
}

export function googleClient() {
  return new google.auth.OAuth2({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_REDIRECT_URL,
  });
}

export { google } from 'googleapis';
