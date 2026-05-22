import { seconds } from '@nestjs/throttler';

export const authThrottle = {
  register: {
    limit: Number(process.env.AUTH_REGISTER_THROTTLE_LIMIT ?? 5),
    ttl: seconds(Number(process.env.AUTH_REGISTER_THROTTLE_TTL_SECONDS ?? 60)),
    blockDuration: seconds(
      Number(process.env.AUTH_REGISTER_THROTTLE_BLOCK_SECONDS ?? 300),
    ),
  },
  login: {
    limit: Number(process.env.AUTH_LOGIN_THROTTLE_LIMIT ?? 5),
    ttl: seconds(Number(process.env.AUTH_LOGIN_THROTTLE_TTL_SECONDS ?? 60)),
    blockDuration: seconds(
      Number(process.env.AUTH_LOGIN_THROTTLE_BLOCK_SECONDS ?? 300),
    ),
  },
  refresh: {
    limit: Number(process.env.AUTH_REFRESH_THROTTLE_LIMIT ?? 20),
    ttl: seconds(Number(process.env.AUTH_REFRESH_THROTTLE_TTL_SECONDS ?? 60)),
    blockDuration: seconds(
      Number(process.env.AUTH_REFRESH_THROTTLE_BLOCK_SECONDS ?? 60),
    ),
  },
} as const;
