import type { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function startGoogleOAuthFlow(
  agent: ReturnType<typeof request.agent>,
) {
  const response = await agent.get('/auth/google').expect(302);
  const redirectUrl = new URL(response.headers.location);
  const state = redirectUrl.searchParams.get('state');

  if (!state) {
    throw new Error('Google OAuth redirect did not include state');
  }

  return {
    response,
    state,
  };
}

export async function completeGoogleOAuthFlow(
  agent: ReturnType<typeof request.agent>,
  state: string,
  code = 'mock-code',
) {
  const callbackResponse = await agent
    .get(`/auth/google/callback?code=${code}&state=${state}`)
    .expect(302);

  const refreshResponse = await agent.post('/auth/refresh').expect(200);
  const accessToken = refreshResponse.body.accessToken as string;

  const meResponse = await agent
    .get('/users/me')
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200);

  return {
    callbackResponse,
    refreshResponse,
    accessToken,
    user: meResponse.body,
  };
}

export async function loginWithGoogleSession(
  app: INestApplication,
  code = 'mock-code',
) {
  const agent = request.agent(app.getHttpServer());
  const { state } = await startGoogleOAuthFlow(agent);
  const session = await completeGoogleOAuthFlow(agent, state, code);

  return {
    agent,
    state,
    ...session,
  };
}
