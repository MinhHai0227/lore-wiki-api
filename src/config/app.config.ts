import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  frontendUrl: trimTrailingSlash(
    process.env.FRONTEND_URL ?? 'http://localhost:5173',
  ),
}));

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}
