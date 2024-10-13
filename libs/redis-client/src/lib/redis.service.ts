import { createClient, RedisDefaultModules, RedisClientType } from 'redis';
import { Injectable } from '@nestjs/common';

Injectable();
export class RedisService {
  client: RedisClientType<RedisDefaultModules>;

  constructor() {
    console.log(process.env['REDIS_URL']);
    this.client = createClient({ url: process.env['REDIS_URL'] });
  }

  async connect() {
    this.client.on('error', (error) => {
      console.error(error);
    });
    await this.client.connect();
  }

  static async registerAsync(): Promise<RedisService> {
    const instance = new RedisService();
    await instance.connect();

    return instance;
  }

  async ping() {
    return this.client.ping();
  }

  getClient() {
    return this.client;
  }
}
