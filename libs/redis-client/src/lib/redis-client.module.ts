import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  controllers: [],
  providers: [
    {
      provide: RedisService,
      async useFactory() {
        const instance = await RedisService.registerAsync();
        return instance;
      },
    },
  ],
  exports: [RedisService],
})
export class RedisClientModule {}
