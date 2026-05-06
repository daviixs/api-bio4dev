import { getRefreshCookieOptions } from './refresh-cookie-options';

describe('getRefreshCookieOptions', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('allows the refresh cookie to be sent from a production frontend on another domain', () => {
    process.env.NODE_ENV = 'production';

    expect(getRefreshCookieOptions()).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/auth',
    });
  });
});
