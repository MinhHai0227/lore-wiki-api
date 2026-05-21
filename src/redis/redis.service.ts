import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

type RedisPayload = string | Buffer | number;

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  get client(): Redis {
    return this.redis;
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async set(
    key: string,
    value: RedisPayload,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds === undefined) {
      return this.redis.set(key, value);
    }

    return this.redis.set(key, value, 'EX', ttlSeconds);
  }

  async setJson<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    return this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }

    return this.redis.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return (await this.redis.expire(key, ttlSeconds)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const count = await this.redis.incr(key);

    if (count === 1 && ttlSeconds !== undefined) {
      await this.expire(key, ttlSeconds);
    }

    return count;
  }

  async publish(
    channel: string,
    payload: RedisPayload | object,
  ): Promise<number> {
    const message =
      typeof payload === 'string' || Buffer.isBuffer(payload)
        ? payload
        : JSON.stringify(payload);

    return this.redis.publish(channel, message);
  }

  createSubscriber(): Redis {
    return this.redis.duplicate();
  }
}
