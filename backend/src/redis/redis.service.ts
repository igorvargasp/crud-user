import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as redis from "ioredis";
import { env } from 'process';

export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: redis.Redis;


    onModuleInit() {
        this.client = new redis.Redis({
            host: env.REDIS_HOST,
            port: Number(env.REDIS_PORT),
        });

    }

    onModuleDestroy() {
        this.client.quit();
    }

    async set(key: string, otp: string, ttlInSeconds: number): Promise<void> {
        await this.client.set(key, otp, 'EX', ttlInSeconds);
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async delete(key: string): Promise<number> {
        return this.client.del(key);
    }


} 