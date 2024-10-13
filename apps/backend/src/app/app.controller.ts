import { Controller, Get } from '@nestjs/common';

import { UserWalletService } from '@kdx-redeemed/data-access-wallet';

@Controller()
export class AppController {
  constructor(private readonly userWallet: UserWalletService) {}

  @Get()
  async getData() {
    return this.userWallet.findMany();
  }
}
