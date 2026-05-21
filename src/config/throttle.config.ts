import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  limit: Number(process.env.THROTTLE_LIMIT ?? 100),
  ttlSeconds: Number(process.env.THROTTLE_TTL_SECONDS ?? 60),
  blockSeconds: Number(process.env.THROTTLE_BLOCK_SECONDS ?? 60),
}));
