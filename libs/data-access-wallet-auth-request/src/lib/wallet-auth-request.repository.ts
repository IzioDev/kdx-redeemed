import { RedisService } from '@kdx-redeemed/redis-client';
import { Injectable } from '@nestjs/common';
import { Entity, Repository, Schema } from 'redis-om';
import { randomUUID } from 'node:crypto';

export interface WalletAuthRequest extends Entity {
  nonce: string;
  address: string;
  at: Date;
}

const schema = new Schema<WalletAuthRequest>('wallet-auth-request', {
  nonce: { type: 'string' },
  address: { type: 'string' },
  at: { type: 'date' },
});

@Injectable()
export class WalletAuthRequestRepository extends Repository<WalletAuthRequest> {
  DEFAULT_TTL = 60 * 5; // 5 minutes

  constructor(private readonly redis: RedisService) {
    super(schema, redis.getClient());
  }

  async generateNewFromAddress(address: string): Promise<WalletAuthRequest> {
    const nonce = randomUUID();
    const entity = await this.save(nonce, { address, nonce, at: new Date() });

    this.expire(nonce, this.DEFAULT_TTL);

    return entity;
  }

  async existsByNonceAndAddress(
    address: string,
    nonce: string
  ): Promise<boolean> {
    const exists = await this.fetch(nonce);

    return exists.nonce === nonce && address === exists.address;
  }
}
