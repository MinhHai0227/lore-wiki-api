import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';
import throttleConfig from './config/throttle.config';
import { PrismaModule } from './database/prisma.module';
import { GenresModule } from './modules/genres/genres.module';
import { RedisModule } from './redis/redis.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesGuard } from './common/guards/roles.guard';
import { WorksModule } from './modules/works/works.module';
import { CharactersModule } from './modules/characters/characters.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        redisConfig,
        storageConfig,
        throttleConfig,
      ],
    }),
    RedisModule,
    StorageModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, getRedisConnectionToken()],
      useFactory: (configService: ConfigService, redis: Redis) => ({
        throttlers: [
          {
            limit: configService.getOrThrow<number>('throttle.limit'),
            ttl: seconds(
              configService.getOrThrow<number>('throttle.ttlSeconds'),
            ),
            blockDuration: seconds(
              configService.getOrThrow<number>('throttle.blockSeconds'),
            ),
          },
        ],
        storage: new ThrottlerStorageRedisService(redis),
      }),
    }),
    PrismaModule,
    GenresModule,
    AuthModule,
    UsersModule,
    WorksModule,
    CharactersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
