import { RedisClientModule } from '@kdx-redeemed/redis-client';
import { Module } from '@nestjs/common';
import { WalletAuthRequestRepository } from './wallet-auth-request.repository';

@Module({
  imports: [RedisClientModule],
  controllers: [],
  providers: [WalletAuthRequestRepository],
  exports: [WalletAuthRequestRepository],
})
export class DataAccessWalletAuthRequestModule {}
