import { DataAccessWalletModule } from '@kdx-redeemed/data-access-wallet';
import { Module } from '@nestjs/common';
import { DataAccessSignatureVerifierModule } from '@kdx-redeemed/data-access-signature-verifier';
import { DataAccessWalletAuthRequestModule } from '@kdx-redeemed/data-access-wallet-auth-request';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    DataAccessWalletModule,
    DataAccessSignatureVerifierModule,
    DataAccessWalletAuthRequestModule,
    JwtModule.register({
      global: true,
      secret: process.env['JWT_SECRET'],
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, JwtModule, AuthGuard],
})
export class BackendAuthModule {}
