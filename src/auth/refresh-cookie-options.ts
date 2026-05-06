import type { CookieOptions } from 'express';

export function getRefreshCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/auth',
  };
}

export function getRefreshCookieClearOptions(): CookieOptions {
  return getRefreshCookieOptions();
}

export function getRefreshCookieSetOptions(): CookieOptions {
  return {
    ...getRefreshCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
