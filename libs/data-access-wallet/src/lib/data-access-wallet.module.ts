import { PrismaClientModule } from '@kdx-redeemed/prisma-client';
import { Module } from '@nestjs/common';
import { UserWalletService } from './user-wallet.service';

@Module({
  imports: [PrismaClientModule],
  controllers: [],
  providers: [UserWalletService],
  exports: [UserWalletService],
})
export class DataAccessWalletModule { }
