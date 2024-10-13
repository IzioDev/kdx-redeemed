import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserWalletService } from '@kdx-redeemed/data-access-wallet';
import { AuthInputPayload } from './auth.type';
import { SignatureVerifierService } from '@kdx-redeemed/data-access-signature-verifier';
import { lastValueFrom } from 'rxjs';
import { WalletAuthRequestRepository } from '@kdx-redeemed/data-access-wallet-auth-request';
import { JwtService } from '@nestjs/jwt';
import { generateAuthMessageToSign } from '@kdx-redeemed/shared-core';

@Injectable()
export class AuthService {
  constructor(
    private readonly userWallet: UserWalletService,
    private readonly singatureVerifier: SignatureVerifierService,
    private readonly walletAuthRequest: WalletAuthRequestRepository,
    private readonly jwt: JwtService
  ) {}

  async getAddressFromMessageVerification(
    authInput: AuthInputPayload
  ): Promise<string | null> {
    if (authInput.type === 'kasware') {
      const result = await lastValueFrom(
        this.singatureVerifier.verify(
          generateAuthMessageToSign(),
          authInput.publicKey,
          authInput.signature
        )
      );

      return result;
    }

    return null;
  }

  async signIn(authInput: AuthInputPayload): Promise<{ accessToken: string }> {
    // verify auth message signature
    const address = await this.getAddressFromMessageVerification(authInput);

    if (!address) {
      throw new UnauthorizedException('Invalid request');
    }

    // find or create user wallet
    let userWallet = await this.userWallet.findUnique({
      where: { address },
    });

    if (userWallet === null) {
      userWallet = await this.userWallet.create({
        data: { address },
      });
    }

    return {
      accessToken: await this.jwt.signAsync({ ...userWallet, version: 1 }),
    };
  }
}
