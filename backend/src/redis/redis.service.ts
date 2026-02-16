import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: 6379,
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }

  async setJSON(key: string, value: any) {
    await this.client.set(key, JSON.stringify(value));
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async expire(key: string, seconds: number) {
    await this.client.expire(key, seconds);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
