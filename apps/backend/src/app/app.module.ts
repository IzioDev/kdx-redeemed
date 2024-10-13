import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { DataAccessWalletModule } from '@kdx-redeemed/data-access-wallet';
import { BackendAuthModule } from '@kdx-redeemed/backend-auth';

@Module({
  imports: [DataAccessWalletModule, BackendAuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
